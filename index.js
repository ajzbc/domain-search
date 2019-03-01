(async () => {

    let domains = [];

    var results = document.getElementById("results");
    results.innerHTML = "";

    //document.getElementById('form').addEventListener('input', typeHandler => {  preferable but idk how to get it to work when typing fast

    document.getElementById('input').addEventListener('submit', async (event) => {
        event.preventDefault();

        let check = [];

        var results = document.getElementById("results");
        results.innerHTML = "";
        
        var nameSearch = document.getElementById('name').value.trim();

        if(nameSearch < 1) {
            results.innerHTML = "";
            return;
        }

        nameSearch = punycode.toASCII(nameSearch);
        nameSearch = nameSearch.toUpperCase();

        var prefix = "";

        if (nameSearch.indexOf('.') > -1 && nameSearch.endsWith(".") != true) {
            var split = nameSearch.split(".");

            for (const domain of domains) {
                if(domain.startsWith(split[split.length-1])) {
                    prefix = ""
                    for(var i = 0; i < split.length-1; i++) {
                        prefix += split[i];
                        if(i != split.length-2) {
                            prefix += ".";
                        }
                    }
                    check.push(domain);
                }
            }
        }

        else {
            for (const domain of domains) {
                if(nameSearch.endsWith(domain) && nameSearch != domain) {
                    var split = nameSearch.split(domain);
                    prefix = split[0]
                    check.push(domain);
                }
            }
        }

        if(check.lnegth < 1) {
            return;
        }

        prefix = prefix.toLowerCase();
        prefix = punycode.toASCII(prefix);

        for (const domain of check) {
            fetch(
                `https://cloudflare-dns.com/dns-query?type=SOA&name=${prefix}.${domain}.`, {
                    headers: {
                        Accept: 'application/dns-json'
                    }
                })
            .then(response => response.json())
            .then(response => {
                let status = false;
                if (response.Answer) {
                    status = response.Answer.some(record => record.type === 6);
                }
                prefix = prefix.toLowerCase();
                prefix = punycode.toUnicode(prefix);
                var extension = domain.toLowerCase();
                var className = (status ? 'domain-taken' : 'domain-free');
                results.innerHTML += '<a id="'+extension+'" class="domain ' + className + '" href="' + (status ? 'http://'+prefix+'.'+extension : '#') + '">' + prefix + "." + extension + '</a>';
            })
            .catch(error => console.log(domain, error));
        }

    });

    domainsFetch = await fetch( 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt' );
    domainsFetch = await domainsFetch.text();
    domains = domainsFetch.trim().split( '\n' );
    domainsFetch = null;
    domains.shift().substring(2) + '.';
})();