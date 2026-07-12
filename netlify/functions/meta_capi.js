exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { event_name, event_id, source_url, client_ip, client_user_agent, fbp, fbc } = body;

        const PIXEL_ID = '6168961836458255';
        const ACCESS_TOKEN = 'EAAwWPFeQEOABRxkWstcWc4ZAsItBsZCDMM5S53nfX0ZC1QxRZBJ94uMZC3Qw67lwq0ZACVdpAKIg7NXsg5ZAiR578eKIYVrgCM1K80hboffTRlHK2ZA3mrZCZAJ4amMPS1PVuFYyByCLlnKypmIbHe7wINV6jyoxY2SivxfRgezTcxY7J3swEB6CSfGwK4onrPYenxSAZDZD';

        const current_timestamp = Math.floor(Date.now() / 1000);

        const userData = {
            client_ip_address: client_ip || event.headers['x-forwarded-for'] || event.headers['client-ip'],
            client_user_agent: client_user_agent || event.headers['user-agent'],
        };

        if (fbp) userData.fbp = fbp;
        if (fbc) userData.fbc = fbc;

        const payload = {
            data: [
                {
                    event_name: event_name,
                    event_time: current_timestamp,
                    action_source: 'website',
                    event_id: event_id,
                    event_source_url: source_url,
                    user_data: userData
                }
            ],
        };

        // Usa o fetch nativo do Node.js 18+
        const response = await fetch(`https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, meta_response: data })
        };
    } catch (error) {
        console.error('Meta CAPI Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
