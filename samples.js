const axios = require('axios');

// Step 1 - Define the constant values.
const aadTenant = 'https://login.microsoftonline.com/';
const aadTenantId = 'af1aa817-5df6-44fc-8d6f-f2f882e3ad32';

const appId = '65c7e40b-a934-4fb9-a250-a6301cffa03d';
const appSecret = 'lzG8Q~NXV-3lQTRYzFtpeIZdoNvqdcUnrWZhhaKT';

const fhirEndpoint =
    'https://xhealth-fhirservice.fhir.azurehealthcareapis.com/';

///////////////////////////////////////////////////////////

function getHttpHeader(accessToken) {
    return {
        Authorization: 'Bearer ' + accessToken,
        'Content-type': 'application/json',
    };
}
function printResourceData(resource) {
    const resourceType = resource['resourceType'];
    const itemId = resource['id'];
    if (resourceType === 'OperationOutcome') {
        console.log('\t' + resource);
    } else {
        const itemId = resource['id'];
        console.log('\t' + resourceType + '/' + itemId);
    }
}
function printResponseResults(response) {
    const responseAsJson = response.data;
    if (!responseAsJson.entry) {
        // Print the resource type and id of a resource.
        printResourceData(responseAsJson);
    } else {
        // Prints the resource type and ids of all resources under a bundle.
        for (const item of responseAsJson.entry) {
            const resource = item.resource;
            printResourceData(resource);
        }
    }
}
///////////////////////////////////////////////////////////

async function getAuthToken() {
    try {
        console.log('Iniciando solicitação de token...')

        const data = new FormData();
        data.append('client_id', appId);
        data.append('client_secret', appSecret);
        data.append('grant_type', 'client_credentials');
        data.append('resource', fhirEndpoint);

        const response = await axios.post(
            aadTenant + aadTenantId + '/oauth2/token',
            data
        );
        const accessToken = response.data.access_token;
        console.log('Solicitação de token concluída' +
            '\tAAD Access Token acquired: ' + accessToken.substring(0, 50) + '...'
        );
        return accessToken;


    } catch (error) {
        console.error('Erro ao solicitar token:', error);
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);

        return null;
    }
}

async function postPatient(accessToken, formData) {
    // Example of FHIR Patient: https://www.hl7.org/fhir/patient-example.json.html

    if (!formData || !formData.name) {
        console.error('Erro: formData não definido ou não contém a propriedade "name"');
        return null;
    }

    const lastName = formData.name.split(' ')[1]; // Sobrenome


    const patientData = {
        resourceType: 'Patient',
        active: true,
        name: [
            {
                use: 'official',
                family: lastName, // Sobrenome
                given: formData.name.split(' ')[0], // Nome
            },
        ],
        gender: formData.gender,
        birthDate: formData.birthDate,
        address: [
            {
                use: 'home',
                type: 'both',
                text: formData.address,
            },
        ],
        telecom: [
            {
                system: 'phone',
                value: formData.phone,
                use: 'mobile',
                rank: 1,
            },
        ],
    };

    try {
        const response = await axios.post(fhirEndpoint + 'Patient', patientData, {
            headers: getHttpHeader(accessToken),
        });
        const resourceId = response.data.id;
        console.log(
            '\tPatient ingested: ' + resourceId + '. HTTP ' + response.status
        );
        return resourceId;
    } catch (error) {
        console.log('Error persisting patient: ' + error);
        return null;
    }
}


async function getPatients(accessToken) {
    // GET htts://<fhir endpoint>/Patient/<patientId>
    const baseUrl = fhirEndpoint + 'Patient';
    try {
        const response = await axios.get(baseUrl, {
            headers: getHttpHeader(accessToken),
        });

        return response?.data;
    } catch (error) {
        console.log('\tError getting patient data: ' + error.response.status);
    }
}

async function getPatients(accessToken) {
    const baseUrl = fhirEndpoint + 'Patient';

    try {
        const response = await axios.get(baseUrl, {
            headers: getHttpHeader(accessToken),
        });

        return response?.data;
    } catch (error) {
        console.log('\tError getting patient data: ' + error.response.status);
    }
}


async function printPatientInfo(patientId, accessToken) {
    const baseUrl = fhirEndpoint + 'Patient/' + patientId; // Monta o URL do paciente com o ID

    try {
        const response = await axios.get(baseUrl, {
            headers: getHttpHeader(accessToken),
        });

        // Verifica se a resposta foi bem-sucedida
        if (response.status === 200) {
            const patientData = response.data;
            console.log('Patient Info:', patientData);

            return patientData;
        }
    } catch (error) {
        console.error('Error getting patient info:', error);
    }
}


///////////////////////////////////////////////////////////

const seed = async () => {
    // Step 2 - Acquire authentication token
    console.log('Acquire authentication token for secure communication.');
    const accessToken = await getAuthToken();
    if (!accessToken) {
        process.exit(1);
    }
    // Step 3 - Insert Patient
    console.log('Persist Patient data.');
    // Dentro da função seed em node/samples.js
    console.log('Persist Patient data.');
    const patientData = {
        name: "Bruna Satiro" || formData.name.split(' ')[0],
        gender: "female" || formData.gender, 
        birthDate: "2003-01-18" || formData.birthDate,
        address: "Endereço do paciente" || formData.address,
        phone: "123-456-7890" || formData.phone,
    };

    const patientId = await postPatient(accessToken, patientData);
    if (!patientId) {
        process.exit(1);
    }

   
    // Step 6 - Print Patient info
    console.log("Query Patient's data.");
    printPatientInfo(patientId, accessToken);

    
};

// Para popular os dados, descomente abaixo e execute
// apenas uma vez
seed();

module.exports = {
    printPatientInfo,
    postPatient,
    getAuthToken,
    getPatients,
}

