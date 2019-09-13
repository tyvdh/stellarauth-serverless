import { headers, parseError } from './js/utils'
import qrcode from 'qrcode'
import _ from 'lodash'
import { StellarKeystore } from 'stellar-keystore'

const stellarKeystore = new StellarKeystore()

export default async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false

    const p_token = decodeURIComponent(_.get(event, 'pathParameters.token'))

    const decoded = JSON.parse(
      Buffer.from(p_token, 'base64').toString()
    )

    if (
      typeof decoded.adata !== 'string'
      && !await stellarKeystore.publicKey(decoded)
    ) throw 'Invalid token'
  
    let qr = await qrcode.toDataURL(p_token)
        qr = qr.replace(/^data:image\/png;base64,/, '')

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'image/png'
      },
      body: qr,
      isBase64Encoded: true
    }
  }

  catch(err) {
    return parseError(err)
  }
}