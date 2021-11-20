import axios, {AxiosResponse, AxiosError} from 'axios'

const BOARD_ID_NAME_DESC = `id, name, description`
export const MONDAY_ENDPOINT = `https://api.monday.com/v2`
const ITEM_GROUP_INFO = `group{id,title}`
export const COLUMN_VALUES = `column_values{ id,  text, value, title}`

export interface HasErrors {
  errors: any[]
}

export interface BoardsType extends HasErrors {
  data: {
    boards: BoardResponse[]
  }
}

export interface BoardItemResponse extends BoardResponse {
  items: ItemResponse[]
}

export interface BoardResponse {
  id: string
  name: string
  description: string
  items?: ItemResponse[]
}

export interface ItemResponse {
  id: string
  name: string
  group: {id: string; title: string}
  column_values: ColumnResponse[]
  updated_at: string
}
export interface ColumnResponse extends BaseColumnProperties {
  value: string | null
  additional_info: string | null
}
export interface BaseColumnProperties {
  id: string
  text: string
  title: string
}

export interface Query {
  query: string
}

export interface IdInserts {
  id: number
  inserts: string[]
}

export const getAllItemsOnBoard = async (boardId: number): Promise<ItemResponse[]> => {
  const board = await getBoardInfoAndAllItems(boardId)
  return board.items
}

export const getBoardInfoAndAllItems = async (id: number): Promise<BoardItemResponse> => {
  const inserts = [`items{ id, updated_at, name, ${ITEM_GROUP_INFO} ${COLUMN_VALUES}}`]
  return (await getBoardInfo({id, inserts})) as BoardItemResponse
}

export const getBoardInfo = async ({id, inserts}: IdInserts): Promise<BoardResponse> => {
  const result = await post<Query, BoardsType>(getBoardData({id: id, inserts}))
  const [board] = result.data.boards as BoardResponse[]
  return board
}

const getBoardData = ({id, inserts}: {id: number; inserts: string[]}): Query => {
  const query = getQueryObject(`{
      boards(ids:${id})
      { ${BOARD_ID_NAME_DESC}
        ${inserts.join()}
       }
    }`)
  return query
}

export const getQueryObject = (queryString: string): {query: string} => {
  return {query: queryString}
}

export const post = async <T, U extends HasErrors>(body: T): Promise<U> => {
  const result: any = await axios
    .post(MONDAY_ENDPOINT, body, {
      headers: {
        Authorization: process.env.MONDAY_TOKEN as string,
      },
    })
    .catch((err) => {
      throw new Error(safeExtractError(err))
    })
  throwIfErrors(result)
  return result.data
}

function throwIfErrors(queryResult: AxiosResponse<any>): void {
  const resultErrors = queryResult?.data?.errors
  if (resultErrors == undefined) {
    return
  }
  if (resultErrors.length > 0) {
    const err = resultErrors.reduce((acc: unknown, e: Error) => {
      return acc + `${e.message}\n`
    }, ``)
    throw new Error(err.slice(0, -1)) // remove final line feed
  }
}

const safeExtractError = (error: AxiosError): string => {
  let msg = error.message
  if (error.response && error.response.data) {
    const resp: any = error.response.data
    msg += ` ${resp.error_code}: ${resp.error_message}`
  }
  if (error.config && error.config.data) {
    msg += `\n${JSON.stringify(error.config.data)}`
  }
  return msg
}
