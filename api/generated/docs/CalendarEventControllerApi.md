# CalendarEventControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createEvent**](#createevent) | **POST** /events | |
|[**deleteEvent**](#deleteevent) | **DELETE** /events/{id} | |
|[**getAllDayEvents**](#getalldayevents) | **GET** /events/all-day | |
|[**getAllEvents**](#getallevents) | **GET** /events | |
|[**getEventById**](#geteventbyid) | **GET** /events/{id} | |
|[**getEventsByAttendee**](#geteventsbyattendee) | **GET** /events/attendee/{attendeeId} | |
|[**getEventsByDateRange**](#geteventsbydaterange) | **GET** /events/date-range | |
|[**getEventsByOrganizer**](#geteventsbyorganizer) | **GET** /events/organizer/{organizerId} | |
|[**getEventsByStatus**](#geteventsbystatus) | **GET** /events/status/{status} | |
|[**getEventsByType**](#geteventsbytype) | **GET** /events/type/{type} | |
|[**getRecurringEvents**](#getrecurringevents) | **GET** /events/recurring | |
|[**getUpcomingEvents**](#getupcomingevents) | **GET** /events/upcoming | |
|[**searchEventsByLocation**](#searcheventsbylocation) | **GET** /events/search/location | |
|[**searchEventsByTitle**](#searcheventsbytitle) | **GET** /events/search/title | |
|[**updateEvent**](#updateevent) | **PUT** /events/{id} | |

# **createEvent**
> CalendarEventDto createEvent(calendarEventDto)


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration,
    CalendarEventDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let calendarEventDto: CalendarEventDto; //

const { status, data } = await apiInstance.createEvent(
    calendarEventDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calendarEventDto** | **CalendarEventDto**|  | |


### Return type

**CalendarEventDto**

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

# **deleteEvent**
> deleteEvent()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteEvent(
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

# **getAllDayEvents**
> PageCalendarEventDto getAllDayEvents()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getAllDayEvents(
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

**PageCalendarEventDto**

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

# **getAllEvents**
> PageCalendarEventDto getAllEvents()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)
let sortBy: string; // (optional) (default to 'startTime')
let sortDir: string; // (optional) (default to 'asc')

const { status, data } = await apiInstance.getAllEvents(
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
| **sortBy** | [**string**] |  | (optional) defaults to 'startTime'|
| **sortDir** | [**string**] |  | (optional) defaults to 'asc'|


### Return type

**PageCalendarEventDto**

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

# **getEventById**
> CalendarEventDto getEventById()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getEventById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**CalendarEventDto**

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

# **getEventsByAttendee**
> PageCalendarEventDto getEventsByAttendee()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let attendeeId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getEventsByAttendee(
    attendeeId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **attendeeId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageCalendarEventDto**

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

# **getEventsByDateRange**
> Array<CalendarEventDto> getEventsByDateRange()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.getEventsByDateRange(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

**Array<CalendarEventDto>**

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

# **getEventsByOrganizer**
> PageCalendarEventDto getEventsByOrganizer()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let organizerId: number; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getEventsByOrganizer(
    organizerId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **organizerId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageCalendarEventDto**

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

# **getEventsByStatus**
> PageCalendarEventDto getEventsByStatus()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let status: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getEventsByStatus(
    status,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageCalendarEventDto**

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

# **getEventsByType**
> PageCalendarEventDto getEventsByType()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let type: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getEventsByType(
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

**PageCalendarEventDto**

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

# **getRecurringEvents**
> PageCalendarEventDto getRecurringEvents()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getRecurringEvents(
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

**PageCalendarEventDto**

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

# **getUpcomingEvents**
> Array<CalendarEventDto> getUpcomingEvents()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUpcomingEvents(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**Array<CalendarEventDto>**

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

# **searchEventsByLocation**
> PageCalendarEventDto searchEventsByLocation()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let location: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.searchEventsByLocation(
    location,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **location** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


### Return type

**PageCalendarEventDto**

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

# **searchEventsByTitle**
> PageCalendarEventDto searchEventsByTitle()


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let title: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.searchEventsByTitle(
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

**PageCalendarEventDto**

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

# **updateEvent**
> CalendarEventDto updateEvent(calendarEventDto)


### Example

```typescript
import {
    CalendarEventControllerApi,
    Configuration,
    CalendarEventDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarEventControllerApi(configuration);

let id: number; // (default to undefined)
let calendarEventDto: CalendarEventDto; //

const { status, data } = await apiInstance.updateEvent(
    id,
    calendarEventDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calendarEventDto** | **CalendarEventDto**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**CalendarEventDto**

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

