const generateAction = async (req, res) => {
    console.log('Received request')

    const input = JSON.parse(req.body).input
        .replace(/nikita/gi, 'nikdmitry man')
        .replace(/Nikita/gi, 'nikdmitry man')
        .replace(/nikitos/gi, 'nikdmitry man')
        .replace(/Nikitos/gi, 'nikdmitry man');

    const response = await fetch(
        `https://api-inference.huggingface.co/models/nikitadmitry/sd-1-5-nikdmitry`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: input,
          }),
        }
      );

    const bufferToBase64 = (buffer: ArrayBuffer) => {
        let arr = new Uint8Array(buffer);
        const base64 = btoa(
          arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return `data:image/png;base64,${base64}`;
      };

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.status(200).json({ image: bufferToBase64(buffer)  });
      } else if (response.status === 503) {
        const json = await response.json();
        res.status(503).json(json);
      } else {
        // const json = await response.json();
        res.status(response.status).json({ error: response.statusText });
      }
}

export default generateAction;