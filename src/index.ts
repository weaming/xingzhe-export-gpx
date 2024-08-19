const clientX = require('./client')
const config = require('./config')
const download = require('download')
const fs = require('fs')

const getMonthList = (month: number) => {
  const {xingzhe_prefix, user_month_info, year, user_id} = config
  return clientX.get( `${xingzhe_prefix}${user_month_info}?user_id=${user_id}&year=${year}&month=${month}`)
}

async function main() {
  const monthList = new Array(12).fill(0).map((_, index) => {
    return getMonthList(index + 1)
  })
  try {
    const res = await Promise.all(monthList)
    res.forEach((item, index) => {
      console.log(`Total ${item.data?.data?.wo_info.length} records in month ${index+1}.`)
      if (item.data?.data?.wo_info.length > 0) {
        item.data?.data?.wo_info.forEach(async (item: any, index: number) => {
          let output = `${__dirname}/../download/${item?.title}-${item?.id}.gpx`;
          if (fs.existsSync(output)) {
            console.log(index+1, item?.title, '✔️')
            return
          }

          const url = ` https://www.imxingzhe.com/xing/${item?.id}/gpx/`
          const {data} = await clientX.get(url)
          // 务必使用buffer，不要使用JSON.stringfy()
          fs.writeFile( output, Buffer.from(data), (err: any) => {
              if (err) { console.log(err, 'err-----') } },
          )
          console.log(index+1, item?.title, '☑️')
        })
      }
    })
  } catch (err) {
    console.log('this err', err)
  }
}

main()
