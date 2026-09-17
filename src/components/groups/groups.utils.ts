import { STATUSES } from '@/shared/constants'
import { Group } from '@/shared/types'

export const isGroupOnline = (group: Group) => {
  return group.subgroups.find((subgroup) => subgroup.status === STATUSES.ONLINE)
}
