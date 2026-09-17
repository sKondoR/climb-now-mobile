/**
 * Типы API для проекта
 * Экспортирует типы, сгенерированные из OpenAPI спецификации
 */

// Импортируем типы из основного файла
import type {
  components,
  operations,
  paths
} from './api';

/**
 * Типы схем из OpenAPI
 * Эти типы используются для типизации ответов API
 */
export type EventResponse = components['schemas']['EventResponse'];
export type BaseResponse = components['schemas']['BaseResponse'];
export type BaseResponseListEvent = components['schemas']['BaseResponse_List_EventResponse__'];
export type BodyFetchEvents = components['schemas']['Body_fetch_events'];
export type BodyFetchEventsRemote = components['schemas']['Body_fetch_events_remote'];
export type HTTPValidationError = components['schemas']['HTTPValidationError'];
export type ValidationError = components['schemas']['ValidationError'];

/**
 * Типы операций из OpenAPI
 * Используются для типизации параметров и ответов API-запросов
 */
export type FetchEventsOperation = operations['fetch_events'];
export type FetchEventsRemoteOperation = operations['fetch_events_remote'];
export type GetTeamsOperation = operations['get_teams'];
export type RootOperation = operations['root'];
export type HealthCheckOperation = operations['health_check'];

/**
 * Типы путей из OpenAPI
 * Используются для типизации URL-путей API
 */
export type ApiPaths = paths;