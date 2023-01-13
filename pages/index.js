import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  // Don't retry more than 20 times
  const maxRetries = 20;
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState('');
  const [img, setImg] = useState('');
  // Numbers of retries 
  const [retry, setRetry] = useState(0);
  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const generateAction = async () => {
    console.log('Generating...');	

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    if (input.indexOf('nikitos') < 0 && input.indexOf('Nikitos') < 0) {
      console.log('you forgot to include Nikitos into search');
      setLogs(`you forgot to include Nikitos into search`);
      return;
    }

    // Set loading has started
    setIsGenerating(true);

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input }),
    });
  
    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      setLogs(`ML Model is loading. Try request again in 5 minutes.`);
      setRetry(data.estimated_time);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }

    // Set final prompt here
    setFinalPrompt(input);
    // Remove content from input box
    setInput('');
    setImg(data.image);
    setIsGenerating(false);
  }

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        // setIsGenerating(false);	
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);  

  return (
    <div className="root">
      <Head>
        <title>Nikita AI Avatar Generator</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>nikita picture generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Generate me in different styles and places. Make sure you refer to me as "Nikitos" in the prompt</h2>
          </div>
          <div className="prompt-container">
            <input className="prompt-box" value={input} onChange={onChange} />
            <div className="prompt-buttons">
            <a className={
              isGenerating ? 'generate-button loading' : 'generate-button'
            } onClick={generateAction}>
              <div className="generate">
              {isGenerating ? (
                <span className="loader"></span>
              ) : (
                <p>Generate</p>
              )}
              </div>
            </a>
          </div>
          </div>
          <div>
            {logs}
          </div>
        </div>
        {img && (
        <div className="output-content">
          <Image src={img} width={512} height={512} alt={finalPrompt} />
          <p>{finalPrompt}</p>
        </div>
        )}
      </div>
      <div className="badge-container">
        <a className="grow"
          href="https://buildspace.so/builds/ai-avatar?utm_source=twitter.com/cardhode&utm_medium=cardhode"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>want to build a similar one?</p>
          </div>
        </a>
        <a className="grow"
          href="https://twitter.com/cardhode"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <p>my twitter</p>
          </div>
        </a>
        <a className="grow"
          href="https://github.com/nikitaclicks"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <p>my github</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
