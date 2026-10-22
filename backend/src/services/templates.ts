const token = process.env.WHATSAPP_TOKEN;
const wabaId = process.env.WABA_ID;

export async function getMetaTemplates() {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${wabaId}/message_templates?status=APPROVED`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meta API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.data; // Array of templates
  } catch (error) {
    console.error('Error fetching Meta templates:', error);
    throw error;
  }
}

export async function sendTemplateMessage(to: string, templateName: string, language: string, variables: string[]) {
  const phoneId = process.env.PHONE_NUMBER_ID;

  try {
    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components: [
          {
            type: 'body',
            parameters: variables.map(v => ({
              type: 'text',
              text: v
            }))
          }
        ]
      }
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meta API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Meta template:', error);
    throw error;
  }
}
