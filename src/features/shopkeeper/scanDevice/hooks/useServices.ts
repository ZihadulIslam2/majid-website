// hooks/useServices.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getServicesApi } from "../../scanDevice/api/scanDevice.api";
import {
  IMEIService,
  ServiceCategory,
} from "../../scanDevice/types/scanDevice.types";

export const useServices = (queryServiceId: string | null) => {
  const { status } = useSession();
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
          let categories = response.data;
          // Filter if guest
          if (status !== "authenticated") {
            categories = categories
              .map((cat) => ({
                ...cat,
                services: cat.services.filter((svc) => svc.isFree),
              }))
              .filter((cat) => cat.services.length > 0);
          }

          setServiceCategories(categories);
          const allServices = categories.flatMap((cat) => cat.services);
          setServices(allServices);

          if (queryServiceId) {
            const found = allServices.find(
              (s) => s.serviceId === parseInt(queryServiceId),
            );
            if (found) {
              setSelectedService(found);
            } else {
              // Try to select first available service if requested is not found
              const firstSvc = allServices[0] || null;
              setSelectedService(firstSvc);
            }
          } else {
            // Select first available service by default if not logged in or no query param
            const firstSvc = allServices[0] || null;
            setSelectedService(firstSvc);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [queryServiceId, status]);

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
