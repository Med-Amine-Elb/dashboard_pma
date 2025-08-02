# CalendarEventDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**startTime** | **string** |  | [optional] [default to undefined]
**endTime** | **string** |  | [optional] [default to undefined]
**location** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**organizerId** | **number** |  | [optional] [default to undefined]
**organizerName** | **string** |  | [optional] [default to undefined]
**attendeeIds** | **Set&lt;number&gt;** |  | [optional] [default to undefined]
**attendeeNames** | **Set&lt;string&gt;** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]
**color** | **string** |  | [optional] [default to undefined]
**recurrence** | **string** |  | [optional] [default to undefined]
**allDay** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { CalendarEventDto } from './api';

const instance: CalendarEventDto = {
    id,
    title,
    description,
    startTime,
    endTime,
    location,
    type,
    status,
    organizerId,
    organizerName,
    attendeeIds,
    attendeeNames,
    createdAt,
    updatedAt,
    color,
    recurrence,
    allDay,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
