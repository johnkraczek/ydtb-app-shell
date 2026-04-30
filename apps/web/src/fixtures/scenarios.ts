import type { StorageScenarioModel } from "@ydtb/storage-static-contracts"

import rootGridOverview from "./scenarios/root-grid-overview.json"
import nestedGridSelection from "./scenarios/nested-grid-selection.json"
import listContextMenu from "./scenarios/list-context-menu.json"
import columnView from "./scenarios/column-view.json"
import uploadModal from "./scenarios/upload-modal.json"

export const scenarios: StorageScenarioModel[] = [
  rootGridOverview,
  nestedGridSelection,
  listContextMenu,
  columnView,
  uploadModal,
] as StorageScenarioModel[]

export function getScenarioById(id: string | null | undefined): StorageScenarioModel {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0]
}
