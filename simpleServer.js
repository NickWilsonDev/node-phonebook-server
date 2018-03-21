/* simpleServer.js */

const http = require('http');

let contacts = [];
let lastId = 0;

let findContact = function(id) {
    id = parseInt(id, 10); // always specify the base
    return contacts.find(function(contact) {
        return contact.id === id;
    });
};

let matches = function(request, method, path) {
    return request.method === method 
           && request.url.startsWith(path);
};

let getSuffix = function(fullUrl, prefix) {
    return fullUrl.slice(prefix.length);
};

let getContacts = function(request, response, id) {
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

let postContacts = function(request, response, id) {
    // read in body from browser
    let body = '';
    request.on('data', function(chunk) {
        body += chunk.toString();
    });
    request.on('end', function() {
        let contact = JSON.parse(body);
        contact.id = ++lastId;
        console.log('Created: ' + contact);
        contacts.push(contact);
        response.end('Contact created');
    });
};

let updateContact = function(request, response, id) {
    //update contact
    if (id) {
        let body = '';
        request.on('data', function(chunk) {
            body += chunk.toString();
        });
        request.on('end', function() {
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

let deleteContact = function(request, response, id) {
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

let notFound = function(request, response) {
    response.setStatus = 404;
    response.end('404 not found');
}

let routes = [
    { method: 'GET', path: '/contacts', handler: getContacts },
    { method: 'POST', path: '/contacts', handler: postContacts },
    { method: 'PUT', path: '/contacts', handler: updateContact }, 
    { method: 'DELETE', path: '/contacts', handler: deleteContact },
]
const server = http.createServer((request, response) => {
    console.log(request.method + ' ' + request.url);
    let id = request.url.split('/').pop();
    let route = routes.find(function(route) {
        return matches(request, route.method, route.path);
    });
    route ? route.handler(request, response, id) : notFound(request, response);
});

server.listen(3000);
