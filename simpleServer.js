/* simpleServer.js */

const http = require('http');

let contacts = [];
let lastId = 0;

let findContact = (id) => {
    id = parseInt(id, 10); // always specify the base
    return contacts.find((contact) => {
        return contact.id === id;
    });
};

let matches = (request, method, path) => {
    return request.method === method 
           && request.url.startsWith(path);
};

let getSuffix = (fullUrl, prefix) => {
    return fullUrl.slice(prefix.length);
};

let getContacts = (request, response, id) => {
    if (id) {
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].id == id) {
                response.end(JSON.stringify(contacts[i]));
            }
        }
    } else {
        response.end(JSON.stringify(contacts));
    }
};

let postContacts = (request, response, id) => {
    // read in body from browser
    let body = '';
    request.on('data', (chunk) => {
        body += chunk.toString();
    });
    request.on('end', () => {
        let contact = JSON.parse(body);
        contact.id = ++lastId;
        console.log('Created: ' + contact);
        contacts.push(contact);
        response.end('Contact created');
    });
};

let updateContact = (request, response, id) => {
    //update contact
    if (id) {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });
        request.on('end', () => {
            let newContact = JSON.parse(body);
            newContact.id = id;
            // delete old contact with the right id
            for (let i = 0; i < contacts.length; i++) {
                if (contacts[i].id == id) {
                    contacts.splice(i, 1);
                    contacts.push(newContact);
                    response.end('Contact updated');
                    break;
                }
            }
            response.end('No contact ' + id + ' found');
        });
    } else {
        response.end('No id specified');
    }
}

let deleteContact = (request, response, id) => {
    if (id) {
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].id == id) {
                contacts.splice(i, 1);
                response.end('Contact ' + id + ' deleted');
                break;
            }
        } 
        response.end('No Contact ' + id + ' found');
    } else {
        response.end('No id specified');
    }
};

let getPika = (request, response) => {
    let str = '/\\︿╱\\\n' + '\\0_ 0 /╱\\╱ \n' + '\\▁︹_/\n'
               + 'IP address:: ' + request.connection.remoteAddress;;
    console.log('IP address:: ' + request.connection.remoteAddress);
    response.end(str);
};

let notFound = (request, response) => {
    response.setStatus = 404;
    response.end('404 not found');
}

let routes = [
    { method: 'GET', path: '/contacts', handler: getContacts },
    { method: 'POST', path: '/contacts', handler: postContacts },
    { method: 'PUT', path: '/contacts', handler: updateContact }, 
    { method: 'DELETE', path: '/contacts', handler: deleteContact },
    { method: 'GET', path: '/pika', handler: getPika },
]
const server = http.createServer((request, response) => {
    console.log(request.method + ' ' + request.url);
    let id = request.url.split('/').pop();
    let route = routes.find((route) => {
        return matches(request, route.method, route.path);
    });
    route ? route.handler(request, response, id) : notFound(request, response);
});

server.listen(3000);
