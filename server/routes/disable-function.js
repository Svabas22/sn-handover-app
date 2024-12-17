const express = require('express');
const { WebSiteManagementClient } = require("@azure/arm-appservice");
const { ManagedIdentityCredential } = require("@azure/identity");

const router = express.Router();

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const functionAppName = process.env.FUNCTION_APP_NAME;
const functionName = process.env.FUNCTION_NAME;

const credential = new ManagedIdentityCredential();
const azureWebClient = new WebSiteManagementClient(credential, subscriptionId);

router.post('/api/disable-function', async (req, res) => {
  const { disable } = req.body;
  try {

    const appSettingsResponse = await azureWebClient.webApps.listApplicationSettings(resourceGroupName, functionAppName);
    const appSettings = appSettingsResponse.properties || {};

    appSettings[`AzureWebJobs.${functionName}.Disabled`] = disable ? "true" : "false";

    await azureWebClient.webApps.updateApplicationSettings(resourceGroupName, functionAppName, { properties: appSettings });

    const status = disable ? 'disabled' : 'enabled';
    res.status(200).json({ message: `Function '${functionName}' has been ${status}.` });
  } catch (error) {
    console.error('Error toggling function state:', error.message);
    res.status(500).json({ error: 'Failed to toggle the Azure Function state.' });
  }
});

router.get('/api/function-status', async (req, res) => {
  try {
    const appSettingsResponse = await azureWebClient.webApps.listApplicationSettings(resourceGroupName, functionAppName);
    const appSettings = appSettingsResponse.properties || {};
    const functionStatus = appSettings[`AzureWebJobs.${functionName}.Disabled`] === "true";

    res.status(200).json({ disabled: functionStatus });
  } catch (error) {
    console.error('Error fetching function status:', error.message);
    res.status(500).json({ error: 'Failed to fetch Azure Function status' });
  }
});

module.exports = router;
