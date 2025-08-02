# MessageControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMessage**](#createmessage) | **POST** /messages | |
|[**deleteMessage**](#deletemessage) | **DELETE** /messages/{id} | |
|[**getMessageById**](#getmessagebyid) | **GET** /messages/{id} | |
|[**getMessagesAfterMessage**](#getmessagesaftermessage) | **GET** /messages/after-message/{conversationId}/{messageId} | |
|[**getMessagesAfterTime**](#getmessagesaftertime) | **GET** /messages/after-time | |
|[**getMessagesByConversation**](#getmessagesbyconversation) | **GET** /messages/conversation/{conversationId} | |
|[**getMessagesBySender**](#getmessagesbysender) | **GET** /messages/sender/{senderId} | |
|[**getMessagesByType**](#getmessagesbytype) | **GET** /messages/type/{type} | |
|[**getStarredMessagesByUser**](#getstarredmessagesbyuser) | **GET** /messages/starred/{userId} | |
|[**getUnreadMessageCount**](#getunreadmessagecount) | **GET** /messages/unread-count/{conversationId}/{userId} | |
|[**getUnreadMessagesForUser**](#getunreadmessagesforuser) | **GET** /messages/unread/{conversationId}/{userId} | |
|[**markAllMessagesAsRead**](#markallmessagesasread) | **PUT** /messages/mark-all-read/{conversationId}/{userId} | |
|[**markMessageAsRead**](#markmessageasread) | **PUT** /messages/{messageId}/read/{userId} | |
|[**searchMessagesByContent**](#searchmessagesbycontent) | **GET** /messages/search/content | |
|[**toggleMessageStar**](#togglemessagestar) | **PUT** /messages/{messageId}/star/{userId} | |
|[**updateMessage**](#updatemessage) | **PUT** /messages/{id} | |

# **createMessage**
> MessageDto createMessage(messageDto)


### Example

```typescript
import {
    MessageControllerApi,
    Configuration,
    MessageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let messageDto: MessageDto; //

const { status, data } = await apiInstance.createMessage(
    messageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **messageDto** | **MessageDto**|  | |


### Return type

**MessageDto**

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

# **deleteMessage**
> deleteMessage()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteMessage(
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

# **getMessageById**
> MessageDto getMessageById()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getMessageById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**MessageDto**

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

# **getMessagesAfterMessage**
> Array<MessageDto> getMessagesAfterMessage()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let conversationId: number; // (default to undefined)
let messageId: number; // (default to undefined)

const { status, data } = await apiInstance.getMessagesAfterMessage(
    conversationId,
    messageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationId** | [**number**] |  | defaults to undefined|
| **messageId** | [**number**] |  | defaults to undefined|


### Return type

**Array<MessageDto>**

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

# **getMessagesAfterTime**
> PageMessageDto getMessagesAfterTime()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let sentAt: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getMessagesAfterTime(
    sentAt,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sentAt** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageMessageDto**

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

# **getMessagesByConversation**
> PageMessageDto getMessagesByConversation()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let conversationId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)
let sortBy: string; // (optional) (default to 'sentAt')
let sortDir: string; // (optional) (default to 'desc')

const { status, data } = await apiInstance.getMessagesByConversation(
    conversationId,
    page,
    size,
    sortBy,
    sortDir
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|
| **sortBy** | [**string**] |  | (optional) defaults to 'sentAt'|
| **sortDir** | [**string**] |  | (optional) defaults to 'desc'|


### Return type

**PageMessageDto**

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

# **getMessagesBySender**
> PageMessageDto getMessagesBySender()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let senderId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getMessagesBySender(
    senderId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **senderId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageMessageDto**

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

# **getMessagesByType**
> PageMessageDto getMessagesByType()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let type: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getMessagesByType(
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
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageMessageDto**

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

# **getStarredMessagesByUser**
> PageMessageDto getStarredMessagesByUser()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let userId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getStarredMessagesByUser(
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

**PageMessageDto**

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

# **getUnreadMessageCount**
> number getUnreadMessageCount()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let conversationId: number; // (default to undefined)
let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUnreadMessageCount(
    conversationId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationId** | [**number**] |  | defaults to undefined|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**number**

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

# **getUnreadMessagesForUser**
> Array<MessageDto> getUnreadMessagesForUser()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let conversationId: number; // (default to undefined)
let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUnreadMessagesForUser(
    conversationId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationId** | [**number**] |  | defaults to undefined|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**Array<MessageDto>**

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

# **markAllMessagesAsRead**
> boolean markAllMessagesAsRead()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let conversationId: number; // (default to undefined)
let userId: number; // (default to undefined)

const { status, data } = await apiInstance.markAllMessagesAsRead(
    conversationId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **conversationId** | [**number**] |  | defaults to undefined|
| **userId** | [**number**] |  | defaults to undefined|


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

# **markMessageAsRead**
> boolean markMessageAsRead()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let messageId: number; // (default to undefined)
let userId: number; // (default to undefined)

const { status, data } = await apiInstance.markMessageAsRead(
    messageId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **messageId** | [**number**] |  | defaults to undefined|
| **userId** | [**number**] |  | defaults to undefined|


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

# **searchMessagesByContent**
> PageMessageDto searchMessagesByContent()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let content: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.searchMessagesByContent(
    content,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **content** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageMessageDto**

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

# **toggleMessageStar**
> boolean toggleMessageStar()


### Example

```typescript
import {
    MessageControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let messageId: number; // (default to undefined)
let userId: number; // (default to undefined)

const { status, data } = await apiInstance.toggleMessageStar(
    messageId,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **messageId** | [**number**] |  | defaults to undefined|
| **userId** | [**number**] |  | defaults to undefined|


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

# **updateMessage**
> MessageDto updateMessage(messageDto)


### Example

```typescript
import {
    MessageControllerApi,
    Configuration,
    MessageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new MessageControllerApi(configuration);

let id: number; // (default to undefined)
let messageDto: MessageDto; //

const { status, data } = await apiInstance.updateMessage(
    id,
    messageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **messageDto** | **MessageDto**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**MessageDto**

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

