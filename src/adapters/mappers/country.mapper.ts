// import { ICountry } from "@atisiothings/laniakea-lib-central/dist/domain/region";
// import { CountryDto } from "../dtos/country.dto";
// import { setTrace } from "@/common/common";

// export class CountryMapper {
//     static toDomain(dto: CountryDto, isNew: boolean = false): ICountry {
//       let country: ICountry = {
//         code: dto.code,
//         name: dto.name,
//         mcc: dto.mcc,
//         language: dto.language,
//         initials: dto.initials,
//       };
//       return setTrace(country, isNew);
//     }
  
//     static toDto(domain: ICountry): CountryDto {
//       return {
//         code: domain.code,
//         name: domain.name,
//         mcc: domain.mcc,
//         language: domain.language,
//         initials: domain.initials,
//       };
//     }
//   }