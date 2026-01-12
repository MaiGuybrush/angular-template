# SSO認證流程

## 初始流程
1. 呼叫UAC API GET 'adAuth/SsoUrl' 取得登入/登出SSO網址並儲存
格式如下：
```json
{
  "loginPage": "http://tnvcimweb1.cminl.oa/InxSSOApp/Logon.aspx",
  "logoutPage": "http://tnvcimweb1.cminl.oa/InxSSOApp/Logout.aspx"
}
```
## 流程一、網站載入(含重新整理)

### case 1: 參數中沒有`CertificateKey`

1. 呼叫UAC API POST 'adAuth/RefreshToken' 
- 若回傳200，記錄使用者資訊與JWT Token，進入系統, 格式如下：
格式如下：
回覆訊息
```json
{
    "no": "10004698",  //employee id
    "id": "GUY.MAI",  //AD 帳號
    "name": "買家暉", //姓名
    "department": "南科企劃資管物流總處/CIM一處/CIM三部", //部門
    "orgShop": "CF2",     //組織所屬shop, 預設值
    "location": "FAB 3", //使用者所在廠區
    "shops": [   //使用者可使用的shop列表
        "TFT5","TFT6"
    ],
    "token": "", //jwt token
    "departmentCode": "9LE53500", //部門代碼
    "refreshToken": ""  //refresh token, server 也會在回應cookie (http only)儲存此token
}
```

- 若回傳401，導向SSO登入頁面(初始流程第1步驟取得的SSO登入網址)

### case 2: 參數中有`CertificateKey`

1. 呼叫UAC API POST 'adAuth/VerifyCert', body 依API規格傳入`CertificateKey`
- 若回傳200，記錄使用者資訊與JWT Token，進入系統
回覆訊息
```json
{
    "no": "10004698",  //employee id
    "id": "GUY.MAI",  //AD 帳號
    "name": "買家暉", //姓名
    "department": "南科企劃資管物流總處/CIM一處/CIM三部", //部門
    "orgShop": "CF2",     //組織所屬shop, 預設值
    "location": "FAB 3", //使用者所在廠區
    "shops": [   //使用者可使用的shop列表
        "TFT5","TFT6"
    ],
    "token": "", //jwt token
    "departmentCode": "9LE53500", //部門代碼
    "refreshToken": ""  //refresh token, server 也會在回應cookie (http only)儲存此token
}
```

- 若回傳401，導向SSO登入頁面(初始流程第1步驟取得的SSO登入網址)，此步驟在10秒鐘內重覆3次，仍失敗則顯示錯誤訊息

## 流程二、使用者登出

1. 呼叫UAC API GET 'adAuth/Logout' 進行登出

## 流程三、Token 失效

當 API 回傳 401 Unauthorized 時，前端應透過 HTTP Interceptor 實作自動刷新 Token 機制：範例程式碼請參考'.docs/jwt-interceptor.ts.sample'

### 1. 請求標頭 (Request Header)
- 所有 API 請求（除例外狀況）應於 Header 加入：`Authorization: Bearer {JWT_TOKEN}`。

### 2. 攔截與檢查規則
- **例外排除**：若 API URL 包含 `Auth/CheckAuthorize`（檢查功能授權），代表僅確認權限，**不執行**自動 Refresh Token 流程，直接回傳錯誤。
- **401 攔截**：捕捉到 401 錯誤時，進入 Refresh Token 流程。

### 3. Refresh Token 流程控制 (Concurrency Handling)
為了避免多個並發請求同時觸發刷新 API，應實作鎖定機制：

- **當「沒有」正在重新整理 Token 時 (`!isRefreshing`)**：
    1. 進入刷新狀態 (`isRefreshing = true`)。
    2. 清空 Token 佇列，並呼叫 UAC API `adAuth/RefreshToken`。
    3. **刷新成功 (200)**：
        - 更新儲存的 Token。
        - 解除刷新狀態。
        - 重新發送原本失敗的請求，並通知其他等待中的請求使用新 Token 繼續執行。
回覆訊息
```json
{
    "no": "10004698",  //employee id
    "id": "GUY.MAI",  //AD 帳號
    "name": "買家暉", //姓名
    "department": "南科企劃資管物流總處/CIM一處/CIM三部", //部門
    "orgShop": "CF2",     //組織所屬shop, 預設值
    "location": "FAB 3", //使用者所在廠區
    "shops": [   //使用者可使用的shop列表
        "TFT5","TFT6"
    ],
    "token": "", //jwt token
    "departmentCode": "9LE53500", //部門代碼
    "refreshToken": ""  //refresh token, server 也會在回應cookie (http only)儲存此token
}
```
    4. **刷新失敗 (401/Error)**：
        - 解除刷新狀態。
        - 執行登出流程 (`adAuth/Logout`) 並導向 SSO 登入頁面。
        
- **當「正在」重新整理 Token 時 (`isRefreshing = true`)**：
    1. 將當前請求暫停並放入佇列（Queue）。
    2. 等待刷新成功的信號後，帶入新 Token 重新發送請求。