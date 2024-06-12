import { maxLength } from "./constants";

export const required = (value: string) => (value ? undefined : "is required");

export const requiredWithParamName = (value: string, paramName: string) =>
  value ? undefined : `${paramName} is required`;

export const requiedWithoutSpacesWithParamName = (
  value: any,
  paramName: any
) => {
  if (!value) {
    return paramName + " is required";
  } else if (value && new RegExp(/\s/).test(value)) {
    return "Spaces are not allowed,please enter a valid" + paramName;
  } else return undefined;
};

export const formvalidators = {
  customerNameRequired: (value: any) =>
    (validateRequiredandlength(value, "account name", maxLength)),
  deviceNameRequired: (value: any) =>
    (validateRequiredandlength(value, "device name", 24)),
  dataCentersRequired: (value: any) =>
    (validateRequiredandlength(value, "Data Center", 32)),
  ValidateScope: (value: any) => (ValidateScopeName(value, "Scope")),
  sfIdRequired: (value: any) =>
    (validateSalesForceID(value, "Salesforce ID")),
  partnernameRequired: (value: any) =>
    (validateRequiredandlength(value, "Partner name", 32)),
  firstnameRequired: (value: any) =>
    (validateRequiredandlength(value, "First name", 250)),
  lastnameRequired: (value: any) =>
    (validateRequiredandlength(value, "Last name", 250)),
  emailisRequired: (value: any) => (validateEmail(value, "email")),
  customerNameValidate: (value: any) =>
    (validateCustomerName(value, "Account Name", 256)),
  customerNameValidateAddModal: (value: any) =>
    (validateCustomerName(value, "Customer Name", 256)),
  domainUrlValidate: (value: any) =>
    (validateDomainUrl(value, "Domain Name")),
  urlValidate: (value: any, paramName: any) =>
    (validateUrl(value, paramName)),
  urlOnlyValidate: (value: any, paramName: any) =>
    (validateOnlyUrl(value, paramName)),

  urlOptionalValidate: (value: any, paramName: any) =>
    (validateOptionalUrl(value, paramName)),
  validURIsValidate: (value: any, paramName: any) =>
    (validRedirectURIs(value, paramName)),
  tenantNameValidate: (value: any) =>
    (validateCustomerName(value, "Tenant Name", 256)),
  refnumValidate: (value: any) => (validateRefNum(value, "refNum")),
  refnumValidateOptional: (value: any) =>
    (ValidateOptionalRefnum(value, "refNum")),
  firstNameValidate: (value: any) =>
    (validateCustomerName(value, "First name", 250)),
  passwordRequired: (value: any) =>
    value ? undefined : "password is required",
  validatepassword: (value: any) =>
    (isPasswordValid(value, "Password")),
  designationRequired: (value: any) =>
    (validateLength(value, "Designation", 250)),
  workLocationRequired: (value: any) =>
    (validateLength(value, "Work location", 250)),
  phoneNumberRequired: (value: any) =>
    (validatePhoneNumber(value, "Contact number")),
  smsRequired: (value: any) =>
    (validatePhoneNumber(value, "SMS number")),
  RoleNameValidate: (value: any) =>
    (validateRoleName(value, "Role Name")),
  ClientNameValidate: (value: any) =>
    (serviceAccountClientNameValidate(value, "Client Name")),
  RoleDescValidate: (value: any) =>
    (validateRoleDesc(value, "Role Description")),
  customdomainValidate: (value: any) =>
    (testCustomCode(value, "Custom Domain")),
};

const testCustomCode = (value: any, paramName: any) => {
  if (value && !(new RegExp(/^[a-zA-Z]+_?[a-zA-Z]+$/).test(value))) return "Enter a valid " + paramName
  else return undefined
};


const validateRoleDesc=(value:any,paramName:any)=>{
  if( value && !(new RegExp(/^[A-Za-z- ]+(?<!-)$/).test(value))) return "Enter a valid "+paramName
  else return undefined};

const serviceAccountClientNameValidate =(value:any,paramName:any)=>{
  if(!value) return paramName+" is required"
  else  if( !(new RegExp(/^[A-Za-z0-9- ]+$/).test(value))) return "Enter a valid "+paramName
  else return undefined};

const validateRoleName=(value:any,paramName:any)=>{
  if(!value) return paramName+" is required"
  else  if( value && !(new RegExp(/^[A-Za-z- ]+(?<!-)$/).test(value))) return "Enter a valid "+paramName
  else return undefined};


const validateSalesForceID=(value:any,paramName:any)=>{
  if(!value) return paramName+" is required"
  else  if(!value.match("^[a-zA-Z0-9!@#$&()\\-`.+,/\"]*$")) return "Enter a valid "+paramName
  else return undefined};

const ValidateScopeName = (value: any, scope: string) => {
  if (!value)
    return (
      "Name cannot be empty. Enter the name of the " +
      scope?.toLocaleLowerCase()
    );
  else if (!new RegExp(/^[^|\/\\]*$/g).test(value))
    return "Special characters are not allowed";
  else return undefined;
};
const validateRequiredandlength = (value: any, paramName: any, length: any) => {
  if (!value) return paramName + " is required";
  else if (value?.length > length) return "Max. length is " + length;
  else return undefined;
};

const validateCustomerName = (
  value: any,
  paramName: any,
  textLength: number
) => {
  if (!value) return paramName + " is required";
  else if (new RegExp(/^\s+|\s\s+|\s+$/g).test(value))
    return (
      "Spaces are not allowed at the beginning or ending of the " +
      paramName?.toLowerCase()
    );
  else if (value.length > textLength)
    return paramName + " must have less than " + maxLength + " characters";
  else return undefined;
};

const validateRefNum = (value: any, paramName: any) => {
  if (!value) {
    return paramName + " is required";
  } else if (value && new RegExp(/\s/).test(value)) {
    return "Spaces are not allowed,please enter a valid" + paramName;
  } else if (value && !new RegExp(/^\d*[A-Z][A-Z\d\s]{3,40}$/).test(value)) {
    return "Enter a valid" + paramName;
  } else return undefined;
};

const ValidateOptionalRefnum = (value: any, paramName: any) => {
  if (value && new RegExp(/\s/).test(value)) {
    return "Spaces are not allowed,please enter a valid refnum";
  } else if (value && !new RegExp(/^\d*[A-Z][A-Z\d\s]{3,40}$/).test(value)) {
    return "Enter a valid refNum";
  } else return undefined;
};

const validateLength = (value: any, paramName: any, length: any) => {
  if (value?.length > length) return "Max. length is " + length;
  else return undefined;
};

const validatePhoneNumber = (value: any, paramName: any) => {
  if (value) {
    if (
      !value.match(
        "^(\\+\\d{1,3}\\s*)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{3,4}$"
      )
    )
      return "Enter a valid " + paramName;
  } else return undefined;
};

const validatePhoneNumberRequired = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  else if (!new RegExp(/^(\+\d{1,3}[- ]?)?\d{10}$/).test(value))
    return "Enter a valid " + paramName;
  else return undefined;
};

const isPasswordValid = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  else if (!new RegExp(/^\S*$/).test(value))
    return "Enter a valid " + paramName + " (spaces not allowed)";
  else return undefined;
};

const validateEmail = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  else if (
    !new RegExp(
      /^[^\s@]+@[^\s@]+(\.[^ !."`'#%&,:;<>=@{}~\$\(\)\*\+_\/\\\?\[\]\^\|]{2,4})$/
    ).test(value)
  )
    return "Enter a valid " + paramName;
  else return undefined;
};

const validateDomainUrl = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  else if (
    !new RegExp(
      "^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])(?<!phenompeople)(?<!.com)$"
    ).test(value)
  )
    return "Enter a valid " + paramName;
  else return undefined;
};

const validateUrl = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  else if (
    !value.match(
      "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?{}*&/=%:]*)?$"
    )
  )
    return "Enter a valid " + paramName;
  else return undefined;
};

const validateOnlyUrl = (value: any, paramName: any) => {
  if (!value) return undefined;
  else if (
    !value.match(
      "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?{}*&/=%:]*)?$"
    )
  )
    return "Enter a valid " + paramName;
  else return undefined;
};

const validateOptionalUrl = (value: any, paramName: any) => {
  if (
    value &&
    !value.match(
      "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?{}*&/=%:]*)?$"
    )
  )
    return "Enter a valid " + paramName;
  else return undefined;
};

const validRedirectURIs = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  else if (value === "*") return undefined;
  else if (value === "+") return undefined;
  else if (
    !value.match(
      "^(https?://)?((?!.)www.|localhost\\:)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9](.|:)[a-z0-9]{2,6}(/[-\\w@\\+\\.~#\\?&/=%\\*]*)?$"
    )
  )
    return "enter a " + paramName;
  else return undefined;
};

export const validateAllowedSkew = (value: any, paramName: any) => {
  if (!value) return undefined;
  else if (isNaN(value)) return paramName + " must be a number ";
  else return undefined;
};
export const validateNumber = (value: any, paramName: any) => {
  if (!value || value.trim() === "") return paramName + " is required";
  else if (isNaN(value)) return paramName + " must be a number ";
  else return undefined;
};

export const validateUrlIncludingLocalHost = (value: any, paramName: any) => {
  if (!value) return paramName + " is required";
  const urlRegex =
    /^(https:\/\/)?(www\.)?((localhost)|(([a-zA-Z0-9-]+)\.)+([a-zA-Z]{2,6}))(?::\d{1,5})?([/?#]\S*)?$/;

  if (!value) return undefined;
  else if (!value.match(urlRegex)) {
    return "Enter a valid " + paramName;
  } else return undefined;
};

export const validateUrlIncludingLocalHostOnly = (value: any, paramName: any) => {
  const urlRegex = /^(https:\/\/)?(www\.)?((localhost)|(([a-zA-Z0-9-]+)\.)+([a-zA-Z]{2,6}))(?::\d{1,5})?([/?#]\S*)?$/;

  if (!value) return undefined
  else if (!value.match(urlRegex)) {
       return "Enter a valid " + paramName;
  }
  else return undefined
};
