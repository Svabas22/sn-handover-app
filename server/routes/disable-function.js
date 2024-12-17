const express = require('express');
const { WebSiteManagementClient } = require("@azure/arm-appservice");
const { DefaultAzureCredential } = require("@azure/identity");

const router = express.Router();

// Azure configuration
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const functionAppName = process.env.FUNCTION_APP_NAME;
const functionName = process.env.FUNCTION_NAME;

const credential = new DefaultAzureCredential();
const azureWebClient = new WebSiteManagementClient(credential, subscriptionId);


router.post('/api/disable-function', async (req, res) => {
  try {
    const appSettingsResponse = await azureWebClient.webApps.listApplicationSettings(resourceGroupName, functionAppName);
    const appSettings = appSettingsResponse.properties || {};

    appSettings[`AzureWebJobs.${functionName}.Disabled`] = "true";

    await azureWebClient.webApps.updateApplicationSettings(resourceGroupName, functionAppName, { properties: appSettings });

    res.status(200).json({ message: `Function '${functionName}' has been disabled.` });
  } catch (error) {
    console.error('Error disabling function:', error.message);
    res.status(500).json({ error: 'Failed to disable the Azure Function' });
  }
});

module.exports = router;
