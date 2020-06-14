/*
 * @Author: Innei
 * @Date: 2020-05-08 17:02:08
 * @LastEditTime: 2020-06-13 09:55:52
 * @LastEditors: Innei
 * @FilePath: /mx-server/libs/common/src/common.module.ts
 * @Coding with Love
 */

import { CacheInterceptor, CacheModule, Module, Provider } from '@nestjs/common'
import * as redisStore from 'cache-manager-redis-store'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TasksModule } from './tasks/tasks.module'
import { RedisModule } from 'nestjs-redis'
import { RedisNames } from './redis/redis.types'
const providers: Provider<any>[] = []

const CacheProvider = {
  provide: APP_INTERCEPTOR,
  useClass: CacheInterceptor,
}
if (process.env.NODE_ENV === 'production') {
  providers.push(CacheProvider)
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
        '.env',
      ],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: () =>
        ~~process.env.REDIS === 1
          ? {
              store: redisStore,
              host: 'localhost',
              port: 6379,
              ttl: 30,
              max: 300,
            }
          : {
              ttl: 30, // seconds
              max: 100, // maximum number of items in cache
            },
    }),
    RedisModule.register([
      {
        name: RedisNames.Access,
        keyPrefix: 'mx_access_',
      },
      {
        name: RedisNames.Like,
        keyPrefix: 'mx_like_',
      },
      {
        name: RedisNames.Read,
        keyPrefix: 'mx_read_',
      },
      {
        name: RedisNames.LoginRecord,
        keyPrefix: 'mx_' + RedisNames.LoginRecord + '_',
      },
    ]),
    TasksModule,
  ],
  providers,
})
export class CommonModule {}
