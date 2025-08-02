# ConversationControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createConversation**](#createconversation) | **POST** /conversations | |
|[**deleteConversation**](#deleteconversation) | **DELETE** /conversations/{id} | |
|[**getAllConversations**](#getallconversations) | **GET** /conversations | |
|[**getConversationById**](#getconversationbyid) | **GET** /conversations/{id} | |
|[**getConversationsByCreator**](#getconversationsbycreator) | **GET** /conversations/creator/{creatorId} | |
|[**getConversationsByParticipant**](#getconversationsbyparticipant) | **GET** /conversations/participant/{userId} | |
|[**getConversationsByType**](#getconversationsbytype) | **GET** /conversations/type/{type} | |
|[**getConversationsWithRecentActivity**](#getconversationswithrecentactivity) | **GET** /conversations/recent-activity | |
|[**getConversationsWithUnreadMessages**](#getconversationswithunreadmessages) | **GET** /conversations/unread/{userId} | |
|[**getDirectConversationBetweenUsers**](#getdirectconversationbetweenusers) | **GET** /conversations/direct/{userId1}/{userId2} | |
|[**getOrCreateDirectConversation**](#getorcreatedirectconversation) | **POST** /conversations/direct/{userId1}/{userId2} | |
|[**searchConversationsByTitle**](#searchconversationsbytitle) | **GET** /conversations/search/title | |
|[**updateConversation**](#updateconversation) | **PUT** /conversations/{id} | |

# **createConversation**
> ConversationDto createConversation(conversationDto)


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration,
    ConversationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let conversationDto: ConversationDto; //

const { status, data } = await apiInstance.createConversation(
    conversationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationDto** | **ConversationDto**|  | |


### Return type

**ConversationDto**

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

# **deleteConversation**
> deleteConversation()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteConversation(
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

# **getAllConversations**
> PageConversationDto getAllConversations()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'updatedAt')
let sortDir: string; // (optional) (default to 'desc')

const { status, data } = await apiInstance.getAllConversations(
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
| **size** | [**number**] |  | (optional) defaults to 10|
| **sortBy** | [**string**] |  | (optional) defaults to 'updatedAt'|
| **sortDir** | [**string**] |  | (optional) defaults to 'desc'|


### Return type

**PageConversationDto**

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

# **getConversationById**
> ConversationDto getConversationById()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getConversationById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**ConversationDto**

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

# **getConversationsByCreator**
> PageConversationDto getConversationsByCreator()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let creatorId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getConversationsByCreator(
    creatorId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **creatorId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageConversationDto**

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

# **getConversationsByParticipant**
> PageConversationDto getConversationsByParticipant()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let userId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getConversationsByParticipant(
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
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageConversationDto**

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

# **getConversationsByType**
> PageConversationDto getConversationsByType()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let type: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getConversationsByType(
    type,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageConversationDto**

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

# **getConversationsWithRecentActivity**
> PageConversationDto getConversationsWithRecentActivity()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getConversationsWithRecentActivity(
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageConversationDto**

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

# **getConversationsWithUnreadMessages**
> Array<ConversationDto> getConversationsWithUnreadMessages()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getConversationsWithUnreadMessages(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**Array<ConversationDto>**

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

# **getDirectConversationBetweenUsers**
> Array<ConversationDto> getDirectConversationBetweenUsers()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let userId1: number; // (default to undefined)
let userId2: number; // (default to undefined)

const { status, data } = await apiInstance.getDirectConversationBetweenUsers(
    userId1,
    userId2
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId1** | [**number**] |  | defaults to undefined|
| **userId2** | [**number**] |  | defaults to undefined|


### Return type

**Array<ConversationDto>**

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

# **getOrCreateDirectConversation**
> ConversationDto getOrCreateDirectConversation()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let userId1: number; // (default to undefined)
let userId2: number; // (default to undefined)

const { status, data } = await apiInstance.getOrCreateDirectConversation(
    userId1,
    userId2
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId1** | [**number**] |  | defaults to undefined|
| **userId2** | [**number**] |  | defaults to undefined|


### Return type

**ConversationDto**

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

# **searchConversationsByTitle**
> PageConversationDto searchConversationsByTitle()


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let title: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.searchConversationsByTitle(
    title,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **title** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageConversationDto**

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

# **updateConversation**
> ConversationDto updateConversation(conversationDto)


### Example

```typescript
import {
    ConversationControllerApi,
    Configuration,
    ConversationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ConversationControllerApi(configuration);

let id: number; // (default to undefined)
let conversationDto: ConversationDto; //

const { status, data } = await apiInstance.updateConversation(
    id,
    conversationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationDto** | **ConversationDto**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**ConversationDto**

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

