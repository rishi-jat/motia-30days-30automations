import { config } from '@motiadev/core'
import statesPlugin from '@motiadev/plugin-states/plugin'
import endpointPlugin from '@motiadev/plugin-endpoint/plugin'
import logsPlugin from '@motiadev/plugin-logs/plugin'
import observabilityPlugin from '@motiadev/plugin-observability/plugin'

export default config({
    plugins: [observabilityPlugin, statesPlugin, endpointPlugin, logsPlugin],
})
