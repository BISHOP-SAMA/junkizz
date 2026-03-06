import { useMutation, useQuery } from "@tanstack/react-query";
import { api, buildUrl, type CreateApplicationInput } from "@shared/routes";

export function useCreateApplication() {
  return useMutation({
    mutationFn: async (data: CreateApplicationInput) => {
      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to submit" }));
        throw new Error(error.message || "Failed to submit application");
      }
      
      return res.json();
    },
  });
}

export function useApplicationStatus() {
  return useMutation({
    mutationFn: async (address: string) => {
      if (!address.trim()) throw new Error("Please enter an EVM address");
      
      const url = buildUrl(api.applications.status.path, { address: address.trim() });
      const res = await fetch(url);
      
      if (res.status === 404) {
        return { status: "not_found" };
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch application status");
      }
      
      return res.json();
    }
  });
}
