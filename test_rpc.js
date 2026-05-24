const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
const client = new SuiClient({ url: getFullnodeUrl('testnet') });
async function main() {
    const projectObj = await client.getObject({
        id: '0x8d0421daebe39fd3d35d51e73c379fb9b3ad02f73ef844d09cf6d33d2457a964',
        options: { showContent: true }
    });
    const fields = projectObj.data.content.fields;
    console.log("execution_mode:", fields.execution_mode);
    console.log("type of execution_mode:", typeof fields.execution_mode);
}
main().catch(console.error);
