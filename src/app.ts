import * as dotenv from 'dotenv'
import {getBoardInfoAndAllItems, ItemResponse} from './monday-api'
dotenv.config()

interface ItemInfo {
  boardName: string
  boardId: string
  item: ItemResponse
}

const SW_DEV_BOARD_ID = 952973649
const SOFT_SKILLS_BOARD_ID = 1418061831

function getCoverageInfo({boardName, boardId, item}: ItemInfo) {
  const desiredState = item.column_values.find((e) => e.id === `status_1`)?.text
  const status = item.column_values.find((e) => e.id === `status`)?.text
  const mktTaxUuid = item.column_values.find((e) => e.id === `text8`)?.text
  const technologyGroup = item.group.title
  const technologyGroupId = item.group.id
  return {
    boardId,
    boardName,
    technologyGroupId,
    technologyGroup,
    technologyId: item.id,
    technologyName: item.name,
    desiredState,
    status,
    mktTaxUuid,
  }
}

async function doBoard(boardId: number): Promise<void> {
  const response = await getBoardInfoAndAllItems(boardId)
  const {id, name, description, items} = response
  console.log(`👉  THE RESPONSE`, id, name, description)
  const coverageRows = items.map((e) => getCoverageInfo({boardId: id, boardName: name, item: e}))
  console.log(`👉 FIRST TEN ROWS\n`, coverageRows.slice(1, 10))
}

async function doApi() {
  doBoard(SW_DEV_BOARD_ID)
  doBoard(SOFT_SKILLS_BOARD_ID)
}

doApi()
