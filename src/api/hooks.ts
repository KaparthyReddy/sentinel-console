import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAlerts,
  fetchReadings,
  fetchShipment,
  fetchShipments,
  fetchSummary,
  fetchThresholds,
  updateAlertStatus,
  updateThreshold,
  type AlertQuery,
  type ShipmentQuery,
} from './services';
import type { AlertAction, ProductThreshold } from './types';

export const queryKeys = {
  summary: ['summary'] as const,
  shipments: (query: ShipmentQuery) => ['shipments', query] as const,
  shipment: (id: string) => ['shipment', id] as const,
  readings: (id: string) => ['readings', id] as const,
  alerts: (query: AlertQuery) => ['alerts', query] as const,
  thresholds: ['thresholds'] as const,
};

export function useSummary() {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: ({ signal }) => fetchSummary(signal),
    refetchInterval: 30_000,
  });
}

export function useShipments(query: ShipmentQuery) {
  return useQuery({
    queryKey: queryKeys.shipments(query),
    queryFn: ({ signal }) => fetchShipments(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: queryKeys.shipment(id),
    queryFn: ({ signal }) => fetchShipment(id, signal),
  });
}

export function useReadings(id: string) {
  return useQuery({
    queryKey: queryKeys.readings(id),
    queryFn: ({ signal }) => fetchReadings(id, signal),
    refetchInterval: 30_000,
  });
}

export function useAlerts(query: AlertQuery) {
  return useQuery({
    queryKey: queryKeys.alerts(query),
    queryFn: ({ signal }) => fetchAlerts(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAlertAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: AlertAction }) =>
      updateAlertStatus(id, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useThresholds() {
  return useQuery({
    queryKey: queryKeys.thresholds,
    queryFn: ({ signal }) => fetchThresholds(signal),
  });
}

export function useUpdateThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...values }: Pick<ProductThreshold, 'id' | 'minTempC' | 'maxTempC'>) =>
      updateThreshold(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.thresholds });
    },
  });
}
