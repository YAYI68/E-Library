import { QueryDto } from "src/common/dto/common.dto";
import { SearchBookResultDto } from "../dto/open-library.dto";


export interface LibraryGatewayInterface {
  search(queryDto: QueryDto): Promise<SearchBookResultDto<any>>;
}