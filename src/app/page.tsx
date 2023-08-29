'use client';

import { useState } from 'react';
import { ExtraAuthTokenGenerator } from '@agagguturu/extra-auth-token-generator';

const parseIntLocal = (n:any, dflt:number):number => {
  if (isNaN(n)) {
    return dflt;
  } else {
    return parseInt(n);
  }
}

export default function Home() {
  const [index, setIndex] = useState('');
  const [token, setToken] = useState('');
  const [sayHelloTo, setSayHelloTo] = useState('');
  const [sayHelloToResponse, setSayHelloToResponse] = useState('');
  const [useExtraAuthToken, setUseExtraAuthToken] = useState(false);
  const [pong, setPong] = useState('');

  // set API host endpoint from .env file
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

  // create ExtraAuthTokenGenerator instance
  const tokenGenerator = new ExtraAuthTokenGenerator();

  // set token generator setting
  tokenGenerator.digits = parseIntLocal(process.env.NEXT_PUBLIC_EXTRA_AUTH_TOKEN_DIGITS, 10);
  tokenGenerator.period = 60; // set to 1 minute
  // tokenGenerator.algorithm = "SHA-512"; // SHA-512 is the default

  // this is the default ExtaAuth token header name used to send the generated token to backend services/API
  // default value is "X-Extra-Auth-Token"
  const extraAuthTokenHeaderName = tokenGenerator.getExtraAuthTokenHeaderName();

  const callServerIndex = async (): Promise<void> => {
    const res = await fetch(`${API_HOST}/`);
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    setIndex(await res.text());
  };

  const callServerSayHello = async (): Promise<void> => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        [extraAuthTokenHeaderName]: tokenGenerator.generate_token(token)
      },
    };

    const res = await fetch(`${API_HOST}/sayHello${useExtraAuthToken ? 'WithToken' : ''}?to=${sayHelloTo}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          Promise.reject(response);
        }
        return response.json();
      })
      .then((data) => {
        setSayHelloToResponse(JSON.stringify(data));
      })
      .catch((error) => {
        setSayHelloToResponse(JSON.stringify(error));
      });
  };

  const callServerToken = async (): Promise<void> => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
      },
    };

    const res = await fetch(`${API_HOST}/token`, requestOptions);
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    setToken(await res.text());
  };

  const callServerPing = async (): Promise<void> => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        [extraAuthTokenHeaderName]: tokenGenerator.generate_token(token)
      },
    };

    const res = await fetch(`${API_HOST}/pingWithToken`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          Promise.reject(response);
        }
        return response.json();
      })
      .then((data) => {
        setPong(JSON.stringify(data));
      })
      .catch((error) => {
        setPong(JSON.stringify(error));
      });
  };

  return (
    <main>
      <h1 className='text-center'>ExtraAuth demostration client app</h1>
      <h3 className='text-center'>How to use Extra-Auth-Token-Generator</h3>

      <div className='m-5'>
        <h5><code>1</code> - Response from unauthenticated API server endpoint <code>GET /</code></h5>
        <code className='d-block border p-2 my-2'>{index}</code>
        <button className='btn btn-primary' type='button' onClick={callServerIndex}>Call Server (/)</button>
      </div>

      <div className='m-5'>
        <div className="mb-3 row">
          <label htmlFor="sayHelloTo" className="col-sm-2 col-form-label">Say hello to:</label>
          <div className="col-sm-2">
            <input type="text" className="form-control" id="sayHelloTo" value={sayHelloTo} onChange={(e) => setSayHelloTo(e.target.value)} />
          </div>
          <label htmlFor="sayHelloTo" className="col-sm-2 col-form-label">Use ExtraAuth token:</label>
          <div className="col-sm-1">
            <input type="checkbox" className="form-check-input" id="useExtaAuthToken" checked={useExtraAuthToken} onChange={(e) => setUseExtraAuthToken(e.target.checked)} />
          </div>
        </div>
        <h5><code>2</code> - Response from authenticated API server endpoint <code>GET /sayHello{useExtraAuthToken ? 'WithToken' : ''}?to={sayHelloTo}</code> <u>{useExtraAuthToken ? 'with' : 'without'}</u> ExtraAuth token being generated</h5>
        <code className='d-block border p-2 my-2'>{sayHelloToResponse}</code>
        <button className='btn btn-primary' type='button' onClick={callServerSayHello}>Call Server (/sayHello)</button>
      </div>

      <div className='m-5'>
        <h5><code>3</code> - Get JWT from server <code>POST /token</code></h5>
        <textarea className='form-control p-2 my-2 font-monospace' rows={4} value={token} onChange={(e) => setToken(e.target.value)}></textarea>
        <button className='btn btn-primary' type='button' onClick={callServerToken}>Call Server (/token)</button>
      </div>

      <div className='m-5'>
        <h5><code>4</code> - Response from authenticated API server endpoint <code>GET /pingWithToken</code></h5>
        <code className='d-block border p-2 my-2'>{pong}</code>
        <button className='btn btn-primary' type='button' onClick={callServerPing}>Call Server (/pingWithToken)</button>
      </div>

      <hr/>

      <a className="btn btn-link" href="https://github.com/gitguru/extra-auth-sample-server" target='_blank'>Server code</a>
      <br/>
      <a className="btn btn-link" href="https://github.com/gitguru/extra-auth-sample-client" target='_blank'>Client code</a>

    </main>
  )
}
