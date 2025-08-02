# FileUploadControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteFile**](#deletefile) | **DELETE** /files/{id} | |
|[**downloadFile**](#downloadfile) | **GET** /files/{id}/download | |
|[**getAllContentTypes**](#getallcontenttypes) | **GET** /files/content-types | |
|[**getAllFileExtensions**](#getallfileextensions) | **GET** /files/extensions | |
|[**getAllFiles**](#getallfiles) | **GET** /files | |
|[**getAllUploadTypes**](#getalluploadtypes) | **GET** /files/upload-types | |
|[**getFileById**](#getfilebyid) | **GET** /files/{id} | |
|[**getFileCountByUploadType**](#getfilecountbyuploadtype) | **GET** /files/stats/type/{uploadType} | |
|[**getFileStatsByUser**](#getfilestatsbyuser) | **GET** /files/stats/user/{userId} | |
|[**getFilesByContentType**](#getfilesbycontenttype) | **GET** /files/content-type/{contentType} | |
|[**getFilesByFileExtension**](#getfilesbyfileextension) | **GET** /files/extension/{fileExtension} | |
|[**getFilesByRelatedEntity**](#getfilesbyrelatedentity) | **GET** /files/related/{entityType}/{entityId} | |
|[**getFilesBySizeRange**](#getfilesbysizerange) | **GET** /files/size-range | |
|[**getFilesByUploadType**](#getfilesbyuploadtype) | **GET** /files/type/{uploadType} | |
|[**getFilesByUser**](#getfilesbyuser) | **GET** /files/user/{userId} | |
|[**getPublicFiles**](#getpublicfiles) | **GET** /files/public | |
|[**searchFilesByDescription**](#searchfilesbydescription) | **GET** /files/search/description | |
|[**searchFilesByFileName**](#searchfilesbyfilename) | **GET** /files/search/filename | |
|[**searchFilesByOriginalName**](#searchfilesbyoriginalname) | **GET** /files/search/originalname | |
|[**updateFileMetadata**](#updatefilemetadata) | **PUT** /files/{id}/metadata | |
|[**uploadFile**](#uploadfile) | **POST** /files/upload | |

# **deleteFile**
> deleteFile()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteFile(
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

# **downloadFile**
> File downloadFile()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.downloadFile(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**File**

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

# **getAllContentTypes**
> Array<string> getAllContentTypes()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

const { status, data } = await apiInstance.getAllContentTypes();
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

# **getAllFileExtensions**
> Array<string> getAllFileExtensions()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

const { status, data } = await apiInstance.getAllFileExtensions();
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

# **getAllFiles**
> PageFileUploadDto getAllFiles()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)
let sortBy: string; // (optional) (default to 'uploadedAt')
let sortDir: string; // (optional) (default to 'desc')

const { status, data } = await apiInstance.getAllFiles(
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
| **sortBy** | [**string**] |  | (optional) defaults to 'uploadedAt'|
| **sortDir** | [**string**] |  | (optional) defaults to 'desc'|


### Return type

**PageFileUploadDto**

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

# **getAllUploadTypes**
> Array<string> getAllUploadTypes()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

const { status, data } = await apiInstance.getAllUploadTypes();
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

# **getFileById**
> FileUploadDto getFileById()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getFileById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**FileUploadDto**

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

# **getFileCountByUploadType**
> object getFileCountByUploadType()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let uploadType: 'AVATAR' | 'ATTACHMENT' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER'; // (default to undefined)

const { status, data } = await apiInstance.getFileCountByUploadType(
    uploadType
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uploadType** | [**&#39;AVATAR&#39; | &#39;ATTACHMENT&#39; | &#39;DOCUMENT&#39; | &#39;IMAGE&#39; | &#39;VIDEO&#39; | &#39;AUDIO&#39; | &#39;OTHER&#39;**]**Array<&#39;AVATAR&#39; &#124; &#39;ATTACHMENT&#39; &#124; &#39;DOCUMENT&#39; &#124; &#39;IMAGE&#39; &#124; &#39;VIDEO&#39; &#124; &#39;AUDIO&#39; &#124; &#39;OTHER&#39;>** |  | defaults to undefined|


### Return type

**object**

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

# **getFileStatsByUser**
> object getFileStatsByUser()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getFileStatsByUser(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**object**

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

# **getFilesByContentType**
> PageFileUploadDto getFilesByContentType()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let contentType: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getFilesByContentType(
    contentType,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **contentType** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **getFilesByFileExtension**
> PageFileUploadDto getFilesByFileExtension()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let fileExtension: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getFilesByFileExtension(
    fileExtension,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **fileExtension** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **getFilesByRelatedEntity**
> PageFileUploadDto getFilesByRelatedEntity()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let entityType: string; // (default to undefined)
let entityId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getFilesByRelatedEntity(
    entityType,
    entityId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **entityType** | [**string**] |  | defaults to undefined|
| **entityId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **getFilesBySizeRange**
> PageFileUploadDto getFilesBySizeRange()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let minSize: number; // (default to undefined)
let maxSize: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getFilesBySizeRange(
    minSize,
    maxSize,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **minSize** | [**number**] |  | defaults to undefined|
| **maxSize** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **getFilesByUploadType**
> PageFileUploadDto getFilesByUploadType()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let uploadType: 'AVATAR' | 'ATTACHMENT' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER'; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getFilesByUploadType(
    uploadType,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uploadType** | [**&#39;AVATAR&#39; | &#39;ATTACHMENT&#39; | &#39;DOCUMENT&#39; | &#39;IMAGE&#39; | &#39;VIDEO&#39; | &#39;AUDIO&#39; | &#39;OTHER&#39;**]**Array<&#39;AVATAR&#39; &#124; &#39;ATTACHMENT&#39; &#124; &#39;DOCUMENT&#39; &#124; &#39;IMAGE&#39; &#124; &#39;VIDEO&#39; &#124; &#39;AUDIO&#39; &#124; &#39;OTHER&#39;>** |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **getFilesByUser**
> PageFileUploadDto getFilesByUser()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let userId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getFilesByUser(
    userId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **getPublicFiles**
> PageFileUploadDto getPublicFiles()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getPublicFiles(
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

**PageFileUploadDto**

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

# **searchFilesByDescription**
> PageFileUploadDto searchFilesByDescription()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let description: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.searchFilesByDescription(
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

**PageFileUploadDto**

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

# **searchFilesByFileName**
> PageFileUploadDto searchFilesByFileName()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let fileName: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.searchFilesByFileName(
    fileName,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **fileName** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **searchFilesByOriginalName**
> PageFileUploadDto searchFilesByOriginalName()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let originalName: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.searchFilesByOriginalName(
    originalName,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **originalName** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageFileUploadDto**

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

# **updateFileMetadata**
> FileUploadDto updateFileMetadata()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let id: number; // (default to undefined)
let description: string; // (optional) (default to undefined)
let isPublic: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.updateFileMetadata(
    id,
    description,
    isPublic
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to undefined|
| **isPublic** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**FileUploadDto**

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

# **uploadFile**
> FileUploadDto uploadFile()


### Example

```typescript
import {
    FileUploadControllerApi,
    Configuration,
    UploadFileRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FileUploadControllerApi(configuration);

let uploadedById: number; // (default to undefined)
let uploadType: 'AVATAR' | 'ATTACHMENT' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER'; // (default to undefined)
let description: string; // (optional) (default to undefined)
let relatedEntityType: string; // (optional) (default to undefined)
let relatedEntityId: number; // (optional) (default to undefined)
let isPublic: boolean; // (optional) (default to false)
let uploadFileRequest: UploadFileRequest; // (optional)

const { status, data } = await apiInstance.uploadFile(
    uploadedById,
    uploadType,
    description,
    relatedEntityType,
    relatedEntityId,
    isPublic,
    uploadFileRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **uploadFileRequest** | **UploadFileRequest**|  | |
| **uploadedById** | [**number**] |  | defaults to undefined|
| **uploadType** | [**&#39;AVATAR&#39; | &#39;ATTACHMENT&#39; | &#39;DOCUMENT&#39; | &#39;IMAGE&#39; | &#39;VIDEO&#39; | &#39;AUDIO&#39; | &#39;OTHER&#39;**]**Array<&#39;AVATAR&#39; &#124; &#39;ATTACHMENT&#39; &#124; &#39;DOCUMENT&#39; &#124; &#39;IMAGE&#39; &#124; &#39;VIDEO&#39; &#124; &#39;AUDIO&#39; &#124; &#39;OTHER&#39;>** |  | defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to undefined|
| **relatedEntityType** | [**string**] |  | (optional) defaults to undefined|
| **relatedEntityId** | [**number**] |  | (optional) defaults to undefined|
| **isPublic** | [**boolean**] |  | (optional) defaults to false|


### Return type

**FileUploadDto**

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

