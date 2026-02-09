// hooks/useCollections.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsService } from "@/services/collections.service";
import { useAuthStore } from "@/stores/authStore";

export function useCollections() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsService.getCollections(),
    enabled: isAuthenticated,
  });
}

export function useCategories() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["categories"],
    queryFn: () => collectionsService.getCategories(),
    enabled: isAuthenticated,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: () => collectionsService.getCollection(id),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      collectionsService.updateCollection(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections", id] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
