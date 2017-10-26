require('../../../src/openlayers/services/SpatialAnalystService');

var originalTimeout, serviceResults;
var sampleServiceUrl = GlobeParameter.spatialAnalystURL;
//插值分析
describe('openlayers_SpatialAnalystService_interpolationAnalysis', function () {
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
        serviceResults = null;
    });
    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    
    //点密度插值分析
    it('interpolationAnalysis_Density test', function (done) {
        var interpolationAnalystParameters = new SuperMap.InterpolationDensityAnalystParameters({
            dataset: "SamplesP@Interpolation",
            //插值分析结果数据集的名称
            outputDatasetName: "Density_Result",
            //插值分析结果数据源的名称
            outputDatasourceName: "Interpolation",
            //结果栅格数据集存储的像素格式
            pixelFormat: SuperMap.PixelFormat.DOUBLE,
            //插值结果栅格数据集的分辨率
            resolution: 3000,
            // 存储用于进行插值分析的字段名称
            zValueFieldName: "AVG_TMP",
            //结果栅格数据集的范围（生效）
            bounds: [-2640403.63, 1873792.1, 3247669.39, 5921501.4]
        });
        var spatialAnalystService = new ol.supermap.SpatialAnalystService(sampleServiceUrl);
        spatialAnalystService.interpolationAnalysis(interpolationAnalystParameters, function (serviceResult) {
            serviceResults = serviceResult;
        });

        setTimeout(function () {
            expect(serviceResults).not.toBeNull();
            expect(serviceResults.type).toBe('processCompleted');
            expect(serviceResults.result.dataset).not.toBeNull();
            done();
        }, 30000);
    });
    //反距离加权插值分析
    it('interpolationAnalysis_IDW_dataset test', function (done) {
        var interpolationAnalystParameters = new SuperMap.InterpolationIDWAnalystParameters({
            //用于做插值分析的数据源中数据集的名称
            dataset: "SamplesP@Interpolation",
            //插值分析结果数据集的名称
            outputDatasetName: "IDW_result",
            //插值分析结果数据源的名称
            outputDatasourceName: "Interpolation",
            //结果栅格数据集存储的像素格式
            pixelFormat: SuperMap.PixelFormat.DOUBLE,
            zValueFieldName: "AVG_TMP",
            resolution: 7923.84989108,
            //采取固定点数查找参与运算点的方式
            searchMode: "KDTREE_FIXED_COUNT",
            //固定点数查找方式下,参与差值运算的点数默认为12。
            expectedCount: 12,
            bounds: [-2640403.63, 1873792.1, 3247669.39, 5921501.4]
        });
        var spatialAnalystService = new ol.supermap.SpatialAnalystService(sampleServiceUrl);
        spatialAnalystService.interpolationAnalysis(interpolationAnalystParameters, function (serviceResult) {
            serviceResults = serviceResult;
        });

        setTimeout(function () {
            expect(serviceResults).not.toBeNull();
            expect(serviceResults.type).toBe('processCompleted');
            expect(serviceResults.result.dataset).not.toBeNull();
            done();
        }, 30000);
    });
    //离散点插值分析
    it('interpolationAnalysis_IDW_geometry test', function (done) {
        var baseurl = "http://localhost:8090/iserver/services/map-temperature/rest/maps/全国温度变化图";
        //通过SQL查询的方法获取用于插值分析的geometry
        var queryBySQLParams, queryBySQLService;
        queryBySQLService = new ol.supermap.QueryService(baseurl);
        queryBySQLParams = new SuperMap.QueryBySQLParameters({
            queryParams: [
                new SuperMap.FilterParameter({
                    name: "SamplesP@Interpolation",
                    attributeFilter: "SMID>0"
                })
            ]
        });
        queryBySQLService.queryBySQL(queryBySQLParams, function (serviceResult) {
            var result = serviceResult.result;
            var z;
            var zMin = parseFloat(-5), zMax = parseFloat(28);
            points = [];
            if (result) {
                for (var i = 0; i < result.recordsets[0].features.features.length; i++) {
                    gp = result.recordsets[0].features.features[i].geometry;
                    var point = new ol.geom.Point([gp.coordinates[0], gp.coordinates[1]]);
                    //每个插值点在插值过程中的权重值
                    z = Math.random() * (zMax - zMin) + zMin;
                    point.tag = z;
                    points.push(point);
                }
            }

            //创建离散点插值分析服务实例
            interpolationAnalystService = new ol.supermap.SpatialAnalystService(sampleServiceUrl);
            //创建离散点插值分析参数实例
            interpolationAnalystParameters = new SuperMap.InterpolationIDWAnalystParameters({
                // 插值分析类型,geometry类型表示对离散点插值分析,默认为“dataset”
                InterpolationAnalystType: "geometry",
                // 插值分析结果数据集的名称
                outputDatasetName: "IDWcretePoints_result",
                // 插值分析结果数据源的名称
                outputDatasourceName: "Interpolation",
                // 结果栅格数据集存储的像素格式
                pixelFormat: SuperMap.PixelFormat.BIT16,
                // 用于做插值分析的离散点集合
                inputPoints: points,
                searchMode: "KDTREE_FIXED_RADIUS",
                // 查找半径,与点数据单位相同
                searchRadius: 200,
                resolution: 3000,
                bounds: [-2640403.63, 1873792.1, 3247669.39, 5921501.4]
            });
            interpolationAnalystService.interpolationAnalysis(interpolationAnalystParameters, function (serviceResult) {
                serviceResults = serviceResult;
            });
        });

        setTimeout(function () {
            expect(serviceResults).not.toBeNull();
            expect(serviceResults.type).toBe('processCompleted');
            expect(serviceResults.result.dataset).not.toBeNull();
            done();
        }, 30000);
    });
});