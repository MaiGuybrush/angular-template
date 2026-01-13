export interface EmpInfo {
  no: string;
  id: string;
  name: string;
  department: string;
  orgShop: string;
  location: string;
  shops: string[];
  token: string;
  departmentCode: string;
  refreshToken: string;
}

export interface SsoUrls {
  loginPage: string;
  logoutPage: string;
}

export interface UserInfo {
  // Add properties as needed based on future requirements, 
  // keeping it generic for now as per reference usage
  userId?: string;
  apName?: string;
  functionName?: string;
  shop?: string;
  no?: number;
  [key: string]: any;
}
