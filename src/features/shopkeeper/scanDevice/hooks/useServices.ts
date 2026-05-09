// hooks/useServices.ts
import { useState, useEffect } from "react";
import { getServicesApi } from "../../scanDevice/api/scanDevice.api";
import {
  IMEIService,
  ServiceCategory,
} from "../../scanDevice/types/scanDevice.types";

export const useServices = (queryServiceId: string | null) => {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [services, setServices] = useState<IMEIService[]>([]);
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          setServiceCategories(response.data);
          const allServices = response.data.flatMap((cat) => cat.services);
          setServices(allServices);

          if (queryServiceId) {
            const found = allServices.find(
              (s) => s.serviceId === parseInt(queryServiceId),
            );
            if (found) {
              setSelectedService(found);
            } else {
              setSelectedService(null);
            }
          } else {
            setSelectedService(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [queryServiceId]);

  return {
    serviceCategories,
    services,
    selectedService,
    setSelectedService,
    isDropdownOpen,
    setIsDropdownOpen,
    isLoading,
  };
};
