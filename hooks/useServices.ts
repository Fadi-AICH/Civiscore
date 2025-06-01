import { useState, useEffect } from 'react';
import { servicesApi } from '@/lib/api';

interface ServiceFilters {
  country_id?: string;
  category?: string;
  min_rating?: number;
  region?: string;
  sort_by?: string;
  sort_desc?: boolean;
  include_country?: boolean;
}

export function useServices(filters: ServiceFilters = {}) {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await servicesApi.getServices(filters);
        setServices(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch services');
        console.error('Error fetching services:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [
    filters.country_id,
    filters.category,
    filters.min_rating,
    filters.region,
    filters.sort_by,
    filters.sort_desc,
    filters.include_country
  ]);

  return { services, isLoading, error };
}

export function useService(id: string) {
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await servicesApi.getService(id);
        setService(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch service details');
        console.error('Error fetching service details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id]);

  return { service, isLoading, error };
}

export function useNearbyServices(latitude: number, longitude: number, radius: number = 5000) {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNearbyServices = async () => {
      if (!latitude || !longitude) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await servicesApi.getNearbyServices(latitude, longitude, radius);
        setServices(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch nearby services');
        console.error('Error fetching nearby services:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyServices();
  }, [latitude, longitude, radius]);

  return { services, isLoading, error };
}
