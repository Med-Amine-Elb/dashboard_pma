# SystemSettingsControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSetting**](#createsetting) | **POST** /settings/system | |
|[**deleteSetting**](#deletesetting) | **DELETE** /settings/system/{id} | |
|[**deleteSettingByKey**](#deletesettingbykey) | **DELETE** /settings/system/key/{key} | |
|[**getAllCategories**](#getallcategories) | **GET** /settings/system/categories | |
|[**getAllSettings**](#getallsettings) | **GET** /settings/system | |
|[**getEditableSettings**](#geteditablesettings) | **GET** /settings/system/editable | |
|[**getEncryptedSettings**](#getencryptedsettings) | **GET** /settings/system/encrypted | |
|[**getSettingById**](#getsettingbyid) | **GET** /settings/system/{id} | |
|[**getSettingByKey**](#getsettingbykey) | **GET** /settings/system/key/{key} | |
|[**getSettingValue**](#getsettingvalue) | **GET** /settings/system/value/{key} | |
|[**getSettingsByCategory**](#getsettingsbycategory) | **GET** /settings/system/category/{category} | |
|[**getSettingsByCategoryAndEditable**](#getsettingsbycategoryandeditable) | **GET** /settings/system/category/{category}/editable/{isEditable} | |
|[**getSettingsByCategoryList**](#getsettingsbycategorylist) | **GET** /settings/system/category/{category}/list | |
|[**getSettingsByDataType**](#getsettingsbydatatype) | **GET** /settings/system/data-type/{dataType} | |
|[**searchSettingsByDescription**](#searchsettingsbydescription) | **GET** /settings/system/search/description | |
|[**searchSettingsByKey**](#searchsettingsbykey) | **GET** /settings/system/search/key | |
|[**settingExists**](#settingexists) | **GET** /settings/system/exists/{key} | |
|[**updateSetting**](#updatesetting) | **PUT** /settings/system/{id} | |
|[**updateSettingByKey**](#updatesettingbykey) | **PUT** /settings/system/key/{key} | |

# **createSetting**
> SystemSettingsDto createSetting(systemSettingsDto)


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration,
    SystemSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let systemSettingsDto: SystemSettingsDto; //

const { status, data } = await apiInstance.createSetting(
    systemSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **systemSettingsDto** | **SystemSettingsDto**|  | |


### Return type

**SystemSettingsDto**

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

# **deleteSetting**
> deleteSetting()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteSetting(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


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

# **deleteSettingByKey**
> deleteSettingByKey()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let key: string; // (default to undefined)

const { status, data } = await apiInstance.deleteSettingByKey(
    key
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|


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

# **getAllCategories**
> Array<string> getAllCategories()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

const { status, data } = await apiInstance.getAllCategories();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<string>**

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

# **getAllSettings**
> PageSystemSettingsDto getAllSettings()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)
let sortBy: string; // (optional) (default to 'key')
let sortDir: string; // (optional) (default to 'asc')

const { status, data } = await apiInstance.getAllSettings(
    page,
    size,
    sortBy,
    sortDir
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|
| **sortBy** | [**string**] |  | (optional) defaults to 'key'|
| **sortDir** | [**string**] |  | (optional) defaults to 'asc'|


### Return type

**PageSystemSettingsDto**

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

# **getEditableSettings**
> PageSystemSettingsDto getEditableSettings()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getEditableSettings(
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **getEncryptedSettings**
> PageSystemSettingsDto getEncryptedSettings()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getEncryptedSettings(
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **getSettingById**
> SystemSettingsDto getSettingById()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getSettingById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**SystemSettingsDto**

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

# **getSettingByKey**
> SystemSettingsDto getSettingByKey()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let key: string; // (default to undefined)

const { status, data } = await apiInstance.getSettingByKey(
    key
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|


### Return type

**SystemSettingsDto**

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

# **getSettingValue**
> string getSettingValue()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let key: string; // (default to undefined)

const { status, data } = await apiInstance.getSettingValue(
    key
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|


### Return type

**string**

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

# **getSettingsByCategory**
> PageSystemSettingsDto getSettingsByCategory()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let category: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getSettingsByCategory(
    category,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **getSettingsByCategoryAndEditable**
> PageSystemSettingsDto getSettingsByCategoryAndEditable()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let category: string; // (default to undefined)
let isEditable: boolean; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getSettingsByCategoryAndEditable(
    category,
    isEditable,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] |  | defaults to undefined|
| **isEditable** | [**boolean**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **getSettingsByCategoryList**
> Array<SystemSettingsDto> getSettingsByCategoryList()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let category: string; // (default to undefined)

const { status, data } = await apiInstance.getSettingsByCategoryList(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] |  | defaults to undefined|


### Return type

**Array<SystemSettingsDto>**

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

# **getSettingsByDataType**
> PageSystemSettingsDto getSettingsByDataType()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let dataType: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getSettingsByDataType(
    dataType,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dataType** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **searchSettingsByDescription**
> PageSystemSettingsDto searchSettingsByDescription()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let description: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.searchSettingsByDescription(
    description,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **description** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **searchSettingsByKey**
> PageSystemSettingsDto searchSettingsByKey()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let key: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.searchSettingsByKey(
    key,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageSystemSettingsDto**

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

# **settingExists**
> boolean settingExists()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let key: string; // (default to undefined)

const { status, data } = await apiInstance.settingExists(
    key
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|


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

# **updateSetting**
> SystemSettingsDto updateSetting(systemSettingsDto)


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration,
    SystemSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let id: number; // (default to undefined)
let systemSettingsDto: SystemSettingsDto; //

const { status, data } = await apiInstance.updateSetting(
    id,
    systemSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **systemSettingsDto** | **SystemSettingsDto**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**SystemSettingsDto**

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

# **updateSettingByKey**
> SystemSettingsDto updateSettingByKey()


### Example

```typescript
import {
    SystemSettingsControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SystemSettingsControllerApi(configuration);

let key: string; // (default to undefined)
let value: string; // (default to undefined)

const { status, data } = await apiInstance.updateSettingByKey(
    key,
    value
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **key** | [**string**] |  | defaults to undefined|
| **value** | [**string**] |  | defaults to undefined|


### Return type

**SystemSettingsDto**

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

