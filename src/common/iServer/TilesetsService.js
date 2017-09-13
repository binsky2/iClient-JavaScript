import SuperMap from '../SuperMap';
import CommonServiceBase from './CommonServiceBase';

/**
 * @class SuperMap.TilesetsService
 * @classdesc 切片列表信息查询服务类;即查询切片地图服务的切片列表，返回切片集名称、地图切片元数据信息、切片版本集信息
 * @extends SuperMap.CommonServiceBase
 * @param url - {string} 地图服务地址。URL应为：<br>
 *                        http://{服务器地址}:{服务端口号}/iserver/services/{服务名}/rest/maps/map；<br>
 *                       例如: "http://localhost:8090/iserver/services/test/rest/maps/tianlocal";
 * @param options - {Object} 交互服务时所需可选参数。如：<br>
 *         eventListeners - {Object} 需要被注册的监听器对象。
 */
export default  class TilesetsService extends CommonServiceBase {

    constructor(url, options) {
        super(url, options);
    }

    /**
     * @override
     */
    destroy() {
        super.destroy();
    }

    /**
     * @function SuperMap.TilesetsService.prototype.processAsync
     * @description 负责将客户端的查询参数传递到服务端。
     */
    processAsync() {
        if (!this.url) {
            return;
        }
        var me = this;
        var end = me.url.substr(me.url.length - 1, 1);

        me.url = me.url + ((end === "/") ? "tilesets" : "/tilesets") + ".json?";

        me.request({
            method: "GET",
            scope: me,
            success: me.serviceProcessCompleted,
            failure: me.serviceProcessFailed
        });
    }

    CLASS_NAME = "SuperMap.TilesetsService"
}

SuperMap.TilesetsService = TilesetsService;