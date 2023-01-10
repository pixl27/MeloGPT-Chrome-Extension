async function api_search(query, numResults, timePeriod, region) {

    var url = `https://ddg-webapp-aagd.vercel.app/search?max_results=3&q=${query}`;

    // const options = {
    //     method: 'POST',
    //     url: 'https://tldrthis.p.rapidapi.com/v1/model/abstractive/summarize-url/',
    //     headers: {
    //       'content-type': 'application/json',
    //       'X-RapidAPI-Key': '9496288973msh4d676f7dbc9b866p1ebb33jsn55e2684623c2',
    //       'X-RapidAPI-Host': 'tldrthis.p.rapidapi.com'
    //     },
    //     data: '{"url":"https://techcrunch.com/2019/08/12/verizon-is-selling-tumblr-to-wordpress-parent-automattic/","min_length":100,"max_length":300,"is_detailed":false}'
    //   };
      
    //var url = `https://ddg-webapp-aagd.vercel.app/search?max_results=${numResults}&q=${query}`;

    if (timePeriod !== "") {
        url += `&time=${timePeriod}`;
    }
    if (region !== "") {
        url += `&region=${region}`;
    }

    const response = await fetch(url);

    return await response.json();
}