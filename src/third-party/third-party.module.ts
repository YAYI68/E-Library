import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { THIRD_PARTY_VENDOR_TYPES } from './constants';
import { LibraryGatewayEnum } from './enums/library.enum';
import { OpenLibraryGateway } from './services/open-library.gateway';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
       OpenLibraryGateway,
     
    // External Library Gateway
{
  provide: THIRD_PARTY_VENDOR_TYPES.Library_GATEWAY_PROVIDER,
  useFactory: (
    configService: ConfigService,
    openLibaryGatewayProvider: OpenLibraryGateway,
  ) => {
    const libraryProvider = configService.get('Library_GATEWAY_PROVIDER');
    switch (libraryProvider.toLowerCase()) {
      case LibraryGatewayEnum.OpenLibrary:
        return openLibaryGatewayProvider;
      default:
        throw new Error(
          `Unknown ai gateway provider: ${libraryProvider} encountered in config`,
        );
    }
  },
  inject: [ConfigService, OpenLibraryGateway],
},

  ],
  controllers: [],
  exports:[
    THIRD_PARTY_VENDOR_TYPES.Library_GATEWAY_PROVIDER,
  ]
})
export class ThirdPartyModule {}
