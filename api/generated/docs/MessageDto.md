# MessageDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**conversationId** | **number** |  | [optional] [default to undefined]
**senderId** | **number** |  | [optional] [default to undefined]
**senderName** | **string** |  | [optional] [default to undefined]
**content** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**sentAt** | **string** |  | [optional] [default to undefined]
**editedAt** | **string** |  | [optional] [default to undefined]
**readByUserIds** | **Set&lt;number&gt;** |  | [optional] [default to undefined]
**readByUserNames** | **Set&lt;string&gt;** |  | [optional] [default to undefined]
**replyToId** | **number** |  | [optional] [default to undefined]
**attachmentUrl** | **string** |  | [optional] [default to undefined]
**edited** | **boolean** |  | [optional] [default to undefined]
**starred** | **boolean** |  | [optional] [default to undefined]
**readByCurrentUser** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { MessageDto } from './api';

const instance: MessageDto = {
    id,
    conversationId,
    senderId,
    senderName,
    content,
    type,
    sentAt,
    editedAt,
    readByUserIds,
    readByUserNames,
    replyToId,
    attachmentUrl,
    edited,
    starred,
    readByCurrentUser,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
