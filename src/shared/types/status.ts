import { STATUSES } from "@/shared/constants";

export type Status = typeof STATUSES[keyof typeof STATUSES] | null