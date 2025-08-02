# UserSettingsControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteUserSettings**](#deleteusersettings) | **DELETE** /settings/user/{userId} | |
|[**getUserSettings**](#getusersettings) | **GET** /settings/user/{userId} | |
|[**resetToDefaults**](#resettodefaults) | **POST** /settings/user/{userId}/reset | |
|[**updateLanguage**](#updatelanguage) | **PUT** /settings/user/{userId}/language | |
|[**updateNotificationSettings**](#updatenotificationsettings) | **PUT** /settings/user/{userId}/notifications | |
|[**updatePageSize**](#updatepagesize) | **PUT** /settings/user/{userId}/page-size | |
|[**updateTheme**](#updatetheme) | **PUT** /settings/user/{userId}/theme | |
|[**updateTimezone**](#updatetimezone) | **PUT** /settings/user/{userId}/timezone | |
|[**updateUserSettings**](#updateusersettings) | **PUT** /settings/user/{userId} | |

# **deleteUserSettings**
> deleteUserSettings()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteUserSettings(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserSettings**
> UserSettingsDto getUserSettings()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUserSettings(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**UserSettingsDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetToDefaults**
> UserSettingsDto resetToDefaults()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.resetToDefaults(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**UserSettingsDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateLanguage**
> boolean updateLanguage()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)
let language: string; // (default to undefined)

const { status, data } = await apiInstance.updateLanguage(
    userId,
    language
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|
| **language** | [**string**] |  | defaults to undefined|


### Return type

**boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateNotificationSettings**
> boolean updateNotificationSettings()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)
let notificationsEnabled: boolean; // (default to undefined)
let emailNotifications: boolean; // (default to undefined)
let smsNotifications: boolean; // (default to undefined)
let pushNotifications: boolean; // (default to undefined)

const { status, data } = await apiInstance.updateNotificationSettings(
    userId,
    notificationsEnabled,
    emailNotifications,
    smsNotifications,
    pushNotifications
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|
| **notificationsEnabled** | [**boolean**] |  | defaults to undefined|
| **emailNotifications** | [**boolean**] |  | defaults to undefined|
| **smsNotifications** | [**boolean**] |  | defaults to undefined|
| **pushNotifications** | [**boolean**] |  | defaults to undefined|


### Return type

**boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePageSize**
> boolean updatePageSize()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)
let pageSize: number; // (default to undefined)

const { status, data } = await apiInstance.updatePageSize(
    userId,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|
| **pageSize** | [**number**] |  | defaults to undefined|


### Return type

**boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateTheme**
> boolean updateTheme()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)
let theme: string; // (default to undefined)

const { status, data } = await apiInstance.updateTheme(
    userId,
    theme
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|
| **theme** | [**string**] |  | defaults to undefined|


### Return type

**boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateTimezone**
> boolean updateTimezone()


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)
let timezone: string; // (default to undefined)

const { status, data } = await apiInstance.updateTimezone(
    userId,
    timezone
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|
| **timezone** | [**string**] |  | defaults to undefined|


### Return type

**boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUserSettings**
> UserSettingsDto updateUserSettings(userSettingsDto)


### Example

```typescript
import {
    UserSettingsControllerApi,
    Configuration,
    UserSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsControllerApi(configuration);

let userId: number; // (default to undefined)
let userSettingsDto: UserSettingsDto; //

const { status, data } = await apiInstance.updateUserSettings(
    userId,
    userSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userSettingsDto** | **UserSettingsDto**|  | |
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**UserSettingsDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

