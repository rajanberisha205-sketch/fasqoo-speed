export default {
  async fetch(request) {

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors
      });
    }

    if (request.method !== 'GET') {
      return json(
        {
          error: 'method_not_allowed'
        },
        405,
        cors
      );
    }

    const url = new URL(request.url);

    const domain = normalizeDomain(
      url.searchParams.get('domain') || ''
    );

    const type =
      String(
        url.searchParams.get('type') || 'A'
      ).toUpperCase();

    const resolverParam =
      String(
        url.searchParams.get('resolver') || 'all'
      ).toLowerCase();

    const allowedTypes =
      new Set([
        'A',
        'AAAA',
        'CNAME',
        'MX',
        'TXT',
        'NS'
      ]);

    if (!isValidDomain(domain)) {
      return json(
        {
          error: 'invalid_domain'
        },
        400,
        cors
      );
    }

    if (!allowedTypes.has(type)) {
      return json(
        {
          error: 'unsupported_type'
        },
        400,
        cors
      );
    }

    const resolvers = {
      cloudflare: {
        name: 'Cloudflare',
        url: 'https://cloudflare-dns.com/dns-query'
      },

      google: {
        name: 'Google',
        url: 'https://dns.google/resolve'
      },

      opendns: {
        name: 'OpenDNS',
        url: 'https://doh.opendns.com/dns-query'
      }
    };

    const names =
      resolverParam === 'all'
        ? Object.keys(resolvers)
        : resolverParam
            .split(',')
            .map(
              value=>value.trim()
            )
            .filter(
              value=>resolvers[value]
            );

    if (!names.length) {
      return json(
        {
          error: 'invalid_resolver'
        },
        400,
        cors
      );
    }

    const results =
      await Promise.all(
        names.map(
          async resolverKey=>{

            const resolver=
              resolvers[resolverKey];

            const started=
              performance.now();

            try{

              const endpoint=
                new URL(resolver.url);

              endpoint.searchParams.set(
                'name',
                domain
              );

              endpoint.searchParams.set(
                'type',
                type
              );

              const response=
                await fetch(
                  endpoint.toString(),
                  {
                    method:'GET',
                    headers:{
                      'accept':
                        'application/dns-json'
                    },
                    cf:{
                      cacheTtl:0,
                      cacheEverything:false
                    }
                  }
                );

              const latency=
                Math.max(
                  0,
                  Math.round(
                    performance.now()-
                    started
                  )
                );

              if(!response.ok){
                throw new Error(
                  `upstream_${response.status}`
                );
              }

              const data=
                await response.json();

              const values=
                extractValues(
                  data,
                  type
                );

              return {
                resolver:resolver.name,
                resolverKey,
                latency,
                status:
                  values.length
                    ? 'success'
                    : 'error',
                values,
                authoritative:
                  Boolean(data.AD),
                responseCode:
                  Number.isInteger(data.Status)
                    ? data.Status
                    : null,
                source:
                  'dns-over-https',
                edge:
                  request.cf?.colo || null
              };

            }catch(error){

              return {
                resolver:resolver.name,
                resolverKey,
                latency:null,
                status:'error',
                values:[],
                error:'resolver_unavailable',
                source:'dns-over-https',
                edge:
                  request.cf?.colo || null
              };
            }
          }
        )
      );

    return json(
      {
        ok:
          results.some(
            result=>
              result.status==='success'
          ),

        domain,
        type,

        workerEdge:
          request.cf?.colo || null,

        results,

        generatedAt:
          new Date().toISOString()
      },
      200,
      cors
    );
  }
};

function normalizeDomain(value){

  return value
    .trim()
    .replace(
      /^https?:\/\//i,
      ''
    )
    .split('/')[0]
    .replace(/\.$/,'')
    .toLowerCase();
}

function isValidDomain(value){

  if(
    value.length<1 ||
    value.length>253
  ){
    return false;
  }

  if(value.includes('..')){
    return false;
  }

  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
}

function extractValues(data,type){

  const answers=
    Array.isArray(data?.Answer)
      ? data.Answer
      : [];

  return answers
    .filter(
      answer=>
        Number(answer.type)===
        dnsTypeCode(type)
    )
    .map(
      answer=>
        String(
          answer.data ?? ''
        )
        .trim()
    )
    .filter(Boolean)
    .map(cleanDnsValue);
}

function cleanDnsValue(value){

  return value
    .replace(/\.$/,'')
    .replace(/\s+/g,' ')
    .trim();
}

function dnsTypeCode(type){

  return {
    A:1,
    NS:2,
    CNAME:5,
    MX:15,
    TXT:16,
    AAAA:28
  }[type];
}

function json(payload,status,headers){

  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers:{
        'Content-Type':
          'application/json; charset=utf-8',
        ...headers
      }
    }
  );
}
