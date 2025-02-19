// cSpell:disable

import { expect } from "vitest";

const result = {
  "descriptor": "29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963",
  "empty": false,
  "balance": expect.any(String),
  "availableBalance": expect.any(String),
  "history": {
    "total": expect.any(Number),
    "unconfirmed": 0,
  },
  "page": {
    "index": 1,
    "size": 25,
    "total": expect.any(Number),
  },
  "misc": {
    "staking": {
      "address": "stake_test1uzas8amdz7gc8jvrrmerk4z5x68el33p9me6f5elqclp6gg6plfse",
      "drep": null,
      "rewards": "0",
      "isActive": false,
      "poolId": null,
    },
  },
  // tokens has the same value reguardless from details; TODO ?
  "tokens": [
    {
      decimals: 0,
      fingerprint: "asset1ag2t7as7xueh24f6rdvzta793vdxf4tsynyzca",
      name: "LaceCoin2",
      quantity: "10",
      ticker: "LaceCoin2",
      unit: "6b728428c0eb014949d72c94449bbef4b10b6ad2b1b86bd4e92476f04c616365436f696e32",
    },
  ],
};

const addresses = {
  "change": [
     {
        "address": "addr_test1qqaszuvz0c4cw560jzzc0sm4q9nxq8f7tn7fzeds7yhmcgamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss7tzwmr",
        "path": "m/1852'/1815'/i'/1/0",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qz9yhmaacww6kv9shk0fpe0n7spc4sgya8rq504xl9vhfldmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sstfgqnt",
        "path": "m/1852'/1815'/i'/1/1",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qza6x7tjp7ltdu3t8zv9duzazf2v68seyr2re2npnm5x6k4mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssrwwu06",
        "path": "m/1852'/1815'/i'/1/2",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qp4ur6s38sfw89euwlstlxuf57ukyukt39ykkuh0t3e0pn9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssydwsu6",
        "path": "m/1852'/1815'/i'/1/3",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qps7vrph6vt2g3fwn5w39g3d66fj0wr4kywf4qn06dfgd59mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sskdhxfr",
        "path": "m/1852'/1815'/i'/1/4",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrx8vgpzkn3eu5mwf8kfyg22nzrk270kruc06r9eh67ke0amq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssv2zq6n",
        "path": "m/1852'/1815'/i'/1/5",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqd9nvz9nws4jgnesz7t65lgn4ft8sk386fth46u73exj3amq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sssyn78k",
        "path": "m/1852'/1815'/i'/1/6",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qz3cmd09djcq20wza5y6evdaa2wxtwvqhuddteek7esv09amq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssuhwqx8",
        "path": "m/1852'/1815'/i'/1/7",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qr2j8gmjxsy8cqdu4fxa6zha092aumfpmtw7wdldyfdak44mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sszdmj4a",
        "path": "m/1852'/1815'/i'/1/8",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzpw4dkh84q8ht94hpdvjvzg48a4xrw55j64ak4xcrkqqkdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sspn4m9s",
        "path": "m/1852'/1815'/i'/1/9",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqtrxlkxythg3dc6sfpgnzee64u2rpxkx8vzrket6qn5la4mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss4y93rt",
        "path": "m/1852'/1815'/i'/1/10",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qz66fj6qpx2cwe098v922v9zl3xrjqyzsuh3cjsjztg7cy9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssmkp43a",
        "path": "m/1852'/1815'/i'/1/11",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qp5was93kpe4u59khk4zv4zxgzywdltuu8dxhnmk7ctlex9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssmln0c7",
        "path": "m/1852'/1815'/i'/1/12",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrpdjs8j08588hljrc0n3prqpck5lukhzvemm6z48fx3zmamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sse42za6",
        "path": "m/1852'/1815'/i'/1/13",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrz340fvgrmvqh3syhpjdzfw26487zp8mkexe48acltuk84mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sshnzcqq",
        "path": "m/1852'/1815'/i'/1/14",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqd2ydlzdzgy4ej4jqhd0qfre0nakjzzy7g3qawq45yl0kamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sshxuh4u",
        "path": "m/1852'/1815'/i'/1/15",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpqa24fqcm348qksvekrvh3wzwh2pts7tmf8yy4v5nzceqdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss726gth",
        "path": "m/1852'/1815'/i'/1/16",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqfvnfpu070mhd0sax99w3lx3kswtns8q5k55p40m2r9w3dmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sslyvfjv",
        "path": "m/1852'/1815'/i'/1/17",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpsekceu9vdz7edrgr08utzthvzhaex5xs33nrnma04hxaamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssyjelll",
        "path": "m/1852'/1815'/i'/1/18",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqzr00wrvha002manjthghfcrparxjf3hkcc8felnfz6ty4mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssvcxys0",
        "path": "m/1852'/1815'/i'/1/19",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     }
  ],
  "used": [
     {
        "address": "addr_test1qr4rcrvjv6ku7u8mdpz3ggesyszcz7uwc7jeyfl76jq23pamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssaxgcuh",
        "path": "m/1852'/1815'/i'/0/0",
        "transfers": expect.any(Number),
        "received": expect.any(String),
        "sent": expect.any(String),
     }
  ],
  "unused": [
     {
        "address": "addr_test1qzjxxjpht73zqurgqpwzs69vsqeskuu26lqkn8fhvg24nsamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssnt40rc",
        "path": "m/1852'/1815'/i'/0/1",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrlp5madt5tjacs4vx8t7d6cv43xm82nuhmg7yh7w7ysl0amq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sswwsw0g",
        "path": "m/1852'/1815'/i'/0/2",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrvdxp5r7z2hlkekhpf9c9g9xf8qg69cwyayvl4ws2hhl59mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssyk4e0z",
        "path": "m/1852'/1815'/i'/0/3",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqp5p93erp4fa2cgd6cfjgejghuek2jgmddv3dmfhkqm3m9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss2ta09x",
        "path": "m/1852'/1815'/i'/0/4",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzf6fh9zjj3m9m7gmlluheu7qhml8f7de6tjllxx7j2wdjdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss7zg4me",
        "path": "m/1852'/1815'/i'/0/5",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzrkf6emr4ss6784epjxn88lzfk6gwn7r0h6l69d69atrjamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss3f8q8l",
        "path": "m/1852'/1815'/i'/0/6",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrs69wk74f29ncncyqyvgk963qtwjcc0f93dvua5cp6rrzamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sswp3z6d",
        "path": "m/1852'/1815'/i'/0/7",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpvh2juga8dea9r20enkk4yrtz9e52l392t532w2djde7camq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssxv732t",
        "path": "m/1852'/1815'/i'/0/8",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrnqdj8mv4wasar4qm6mdgt22cvhhd2sfyalcklwuq0h5jdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssypdhad",
        "path": "m/1852'/1815'/i'/0/9",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrzkury00e59knggzdycztrym558e2xtvt6tegu6a999uxamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sscez0au",
        "path": "m/1852'/1815'/i'/0/10",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qq0mgxs2seh9q8q8pwzae2atmy6ygu9mwqftfk4szax8d24mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss4lmgu7",
        "path": "m/1852'/1815'/i'/0/11",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqmn89et2frxt0g8lmrmfqh3uxm8ln548ngh3e74jm6vet9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss6a0jhe",
        "path": "m/1852'/1815'/i'/0/12",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qre6rr9svy0ncuu8ea4rhcgnczvl9vls6lmyguelqk2mek4mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss6swe05",
        "path": "m/1852'/1815'/i'/0/13",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzn699gny3fnslf6vg6ssp08k8jjlkzwuya2y8yt7s6cay9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss6fsdkc",
        "path": "m/1852'/1815'/i'/0/14",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqthnr857n9e3j74xputt4yve8z8gzjtlsyya7vkrhgvmx9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssth64vk",
        "path": "m/1852'/1815'/i'/0/15",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpakx2759hhywr8e70hrud8yh7etm2y89fwhmlu5umx3lq9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sst4l3kh",
        "path": "m/1852'/1815'/i'/0/16",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpfqazh7uhvns9ek3p6rkgt9pl9w6udcqvn9fs0cc7m0x2dmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssgeredp",
        "path": "m/1852'/1815'/i'/0/17",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qr424zp6v4g8gzljwgxvcwqmpav2e3w2paugc23klpm8yudmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssqln4vz",
        "path": "m/1852'/1815'/i'/0/18",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpk4yzyvdt8jz5lllmc80p9hyzywj3px4a37je7ufh33rdamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss6md7wg",
        "path": "m/1852'/1815'/i'/0/19",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzq29utq9e5xduw7v5dpwvptsd5hn8y2gkl0t8pn2g69khamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss3hmg0y",
        "path": "m/1852'/1815'/i'/0/20",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrh975n70egef7t9t33y7lqxdm8k8dcrpsqjdaqj0vfd5zdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssu08c33",
        "path": "m/1852'/1815'/i'/0/21",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qz64gnwcf3haxr2lh3paf8px2gae3chml4qh62jk4q3mp0dmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sszjxprr",
        "path": "m/1852'/1815'/i'/0/22",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzsmpaku7lrz3zm9ppcykvjvqkut3tffqsc07jft9v9qhc9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssjvmda7",
        "path": "m/1852'/1815'/i'/0/23",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqaruer7u0vsckt2w8knzr8l9jevpmm7jtdyk6dhdun0x9amq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssm86dxh",
        "path": "m/1852'/1815'/i'/0/24",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qrpjpw7dwwk324w7gan0vasdctea2x6axk5dasq2eszmnwamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssnzhj8f",
        "path": "m/1852'/1815'/i'/0/25",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqc8m2f4mnhus3duu8s6ts38rhx43np9p22nhmapkcun9zamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssaervcu",
        "path": "m/1852'/1815'/i'/0/26",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qplw6hlu8nfmfqfuv3sg90m5t8uk307trdjvv8w2hzr55c9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss3sq3za",
        "path": "m/1852'/1815'/i'/0/27",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqsr02dwe57etfrdhjl4pqpsfn5he7ruw3ykxz8u4runhs9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssm67eew",
        "path": "m/1852'/1815'/i'/0/28",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qplq69phda3hpvcjy2jt9mh67eyqy364uvdhugngkrcjsw9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss9yjx52",
        "path": "m/1852'/1815'/i'/0/29",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqdqc6753x9g4tygck2eaj2tsnyrjrvj5hhf3566yw8gdmdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss7jrt2u",
        "path": "m/1852'/1815'/i'/0/30",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpcagmhnm3z6yg4c7k3m5fxs0s0a093sc0fw6pjpfezs6tdmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss2gasvl",
        "path": "m/1852'/1815'/i'/0/31",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzp6thz9dsuy5kfcjppjzzvws4cq34c0gsyeqqyve7p8mhamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss9juex2",
        "path": "m/1852'/1815'/i'/0/32",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqejr47cqxv5z90e4yk27r0xl73d2hw0sleppdrgzrvhm59mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss0jknfe",
        "path": "m/1852'/1815'/i'/0/33",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qz5h05vwwekw3jykt84fd8a6fr5rjfnzd0fyw97w6p0v9jamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sssn6ahm",
        "path": "m/1852'/1815'/i'/0/34",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qqgke2wkukxjueadgz6ve8644ca76x5uuvlvczk9rrw506dmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sslv9n6r",
        "path": "m/1852'/1815'/i'/0/35",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qpexlhlhl67h446fjlqk5gcj2da03722wr9pw8c0f9ygh0amq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssnt00yd",
        "path": "m/1852'/1815'/i'/0/36",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qr95m6ys4cvvgjdar0mj30vey9qfnq7vjlq05h36zpz8p2dmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssq3m264",
        "path": "m/1852'/1815'/i'/0/37",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qz6278gev8sd9xf8pufmlwatpr0quxu3sacnmde6as5xek9mq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5sshdud9e",
        "path": "m/1852'/1815'/i'/0/38",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
     {
        "address": "addr_test1qzfucfj3szrn0m9nn20txrjj6cxxxy3d4j48fc5j9prgsydmq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ss8wdccr",
        "path": "m/1852'/1815'/i'/0/39",
        "transfers": 0,
        "received": "0",
        "sent": "0",
     },
  ],
};

export default [
  {
    testName: 'GET_ACCOUNT_INFO - success - basic - preprod',
    descriptor: '29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963',
    details: 'basic',
    page: 1,
    pageSize: 25,
    result,
  },
  {
    testName: 'GET_ACCOUNT_INFO - success - tokens - preprod',
    descriptor: '29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963',
    details: 'tokens',
    page: 1,
    pageSize: 25,
    result,
  },
  {
    testName: 'GET_ACCOUNT_INFO - success - tokenBalances - preprod',
    descriptor: '29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963',
    details: 'tokenBalances',
    page: 1,
    pageSize: 25,
    result: {
      ...result,
      addresses,
    },
  },
  {
    testName: 'GET_ACCOUNT_INFO - success - txids - preprod',
    descriptor: '29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963',
    details: 'txids',
    page: 1,
    pageSize: 25,
      result: {
        ...result,
        history: {
          ...result.history,
          // txs are reverse sorted so this can't be deeply checked: new txs would make this to fail
          txids: expect.any(Array),
        },
      },
  },
  {
    testName: 'GET_ACCOUNT_INFO - success - txs - preprod',
    descriptor: '29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963',
    details: 'txs',
    page: 1,
    pageSize: 25,
    result: {
      ...result,
      addresses,
      history: {
        ...result.history,
          // txs are reverse sorted so this can't be deeply checked: new txs would make this to fail
          transactions: expect.any(Array),
      },
    },
},
] as const;

