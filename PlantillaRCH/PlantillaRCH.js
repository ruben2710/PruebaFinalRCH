var mapMain;
var tb;
require(["esri/map",
    //para introducir el servicio "http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer"
    "esri/layers/ArcGISDynamicMapServiceLayer",
    //Para hacer una extension recuadro
    "esri/geometry/Extent",
    //Para introducir el widget de escala
    "esri/dijit/Scalebar",
    // para introducir la leyenda
    "esri/dijit/Legend",
    //Para introducir la Galeria de mapas
    "esri/dijit/BasemapGallery",
    //Para dibujar en mapa un polígono y hacer seleccion.
    "esri/layers/FeatureLayer",
    "esri/dijit/FeatureTable",
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/graphicsUtils",
    "esri/tasks/query",
    //Para introducir el widget Overview
    "esri/dijit/OverviewMap",
    //Para introducir el widget HomeButton
    "esri/dijit/HomeButton",
    //Para introducir el widget Search
    "esri/dijit/Search",
    "esri/dijit/PopupTemplate",
    // Funciones para simbología
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",

    "dojo/on",
    "dojo/fx",
    "dojo/ready",
    "dojo/parser",
    "dojo/dom",
    "dojo/store/Memory",
    "dojo/date/locale",
    "dojo/_base/Color",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dojo/domReady!"],
    function (Map, ArcGISDynamicMapServiceLayer, Extent, Scalebar, Legend, BasemapGallery, FeatureLayer, FeatureTable, Draw,
        Graphic, graphicsUtils, query, OverviewMap, HomeButton, Search, PopupTemplate, on, ready, parser, dom, Memory, locale, Grid, Selection,
        Color, declare, array, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol
    ) {

        /*
       * Paso 11: En el panel tareas tenemos un botón que cuando pulsemos sobre él, activaremos la herramienta Draw para poder 
       seleccionar desde el mapa ciudades (con temática de puntos amarillos y con el identificador 0 del MapServer) creando una extensión. 
       Una vez creada la extensión resaltaremos en el mapa las ciudades que están bajo la extensión dibujada.
       */

      on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
      
      var tb = new Draw(mapMain);
      
      function fPintaYQuery() {

      mapMain.setInfoWindowOnClick(false);
        

          tb.on("draw-end", displayPolygon);
          tb.activate(Draw.POLYGON);
      };

      function displayPolygon(evt) {
        var geometryInput = evt.geometry;

      

              var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, 
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));

              

              mapMain.graphics.clear();

            

              var graphicPolygon = new Graphic(geometryInput, tbDrawSymbol);
              mapMain.graphics.add(graphicPolygon);

              selectCities(geometryInput);
              };

              function selectCities(geometryInput) {

                
                var symbolSelected = new SimpleMarkerSymbol({
                    "type": "esriSMS",
                    "style": "esriSMSCircle",
                    "color": [255, 115, 0, 128],
                    "size": 6,
                    "outline": {
                        "color": [255, 0, 0, 214],
                        "width": 1
                    }
                });

                
                ftCities.setSelectionSymbol(symbolSelected);

                var queryCities = new Query();
                queryCities.geometry = geometryInput;  


                ftCities.on("selection-complete", populateGrid)


                lyrCities.selectFeatures(queryCities, FeatureLayer.SELECTION_NEW)

              }

              function populateGrid(results) {

               
                

                var dataCities = array.map(results.features, function (feature) {
                    return {

                        

                        "areaname": feature.attributes[outFieldsCities[0]],
                        "class": feature.attributes[outFieldsCities[1]],
                        "st": feature.attributes[outFieldsCities[2]],
                        "capital": feature.attributes[outFieldsCities[3]],
                        
                        
                        



                    }
                });

                 // Pass the data to the grid
                 var memStore = new Memory({
                  data: dataCities
                });
                gridCities.set("store", memStore);
                

    



                
            };
  
  
      on(dojo.byId("clear"),"click",fClearCities); 

      
      function fClearCities(){      
        ftCities.clearSelection();
        mapMain.graphics.clear();
        TableCities.clearFilter();
        tb.deactivate();
        

        mapMain.setInfoWindowOnClick(true);
        
      };
      

        /*
        * Paso 12: En el panel inferior de la aplicación podremos escribir el nombre de un estado y 
        al pulsar sobre el botón “Ir a estado”, seleccionará el estado introducido en la caja de texto, (ejemplo: “Arizona”). 
        Al mostrar el estado seleccionado en el mapa centrar la extensión sobre ese estado. Esta capa tiene el identificador 2 del MapServer.
        */

       on(dojo.byId("progButtonNode"), "click", fQueryEstados);

        function fQueryEstados() {


            var inputState = dojo.byId("dtb").value;

            var sbState = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                    new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5])
            );


            ftStates.setSelectionSymbol(sbState);


            var queryState = new Query();
            queryState.where = "state_name =" + "'" + inputState + "'";

            ftStates.selectFeatures(queryState, FeatureLayer.SELECTION_NEW, function (selection) {
                var centerSt = graphicsUtils.graphicsExtent(selection).getCenter();
                var extentSt = esri.graphicsExtent(selection);

                mapMain.setExtent(extentSt.getExtent().expand(2));
                mapMain.centerAt(centerSt);
            });
        };


        //Paso 2: Especificar la extensión inicial.

        var extensioninicial = new Extent({
            "xmin": -10903711.054937014,
            "ymin": 3162302.965026151,
            "xmax": -9093682.225144522,
            "ymax": 5892022.119145639,
            "spatialReference": {
                "wkid": 102100
            }
        });


        //Paso 1. Inclusión del mapa: Crearemos el mapa en el cual añadiremos el mapa base. 

        mapMain = new Map("map", {
            basemap: "national-geographic",
            extent: extensioninicial
        });

        /*
         * Paso 3: Inclusión de capas dinámicas. Consumo de MapService. 
        //* Capas:		"http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer"
        //* Ciudades:	"http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0"
        //* Carreteras:	"http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/1"
        //* Estados:	"http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2"
        //* Paises:		"http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/3"
         */
        var lyrUSA = new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer", {
        opacity: 0.25});
        lyrUSA.setVisibleLayers([1,3]);

        /*
          * Paso 4: Añadir la capa de ciudades el mapa.
          */
         var ftCities = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0", {
            outFields: ["*"]
        });

        var ftStates = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2", {
            outFields: ["*"]
        });



        mapMain.on("load", function (evt) {
            mapMain.resize();
            mapMain.reposition();


            /*
            * Paso 3: Uso del método addLayer para mostrar las variables en el mapa.
            
            mapMain.addLayer(ftCities);
            mapMain.addLayer(ftStates);
            */
            mapMain.addLayers([lyrUSA, ftCities, ftStates]);

        });
        /*
            * Paso 5: Añadir Widget. Colección de mapa base. Class: BasemapGallery dentro del Dijit. 
            */
        var basemapGallery = new BasemapGallery({
            map: mapMain,
            showArcGISBasemaps: true
        }, "mapabaseDiv");
        basemapGallery.startup();

        /*
         * Paso 6: Añadir Widget. Barra de escala. Class: Scalebar dentro del Dijit. Unidades en millas y en metros.
         */
        var digitScalebar = new Scalebar({
            map: mapMain,
            scalebarUnit: "dual",
            scalebarStyle: "line",
            attachTo: "bottom-left"
        });

        /*
         * Paso 7: Añadir Widget. Leyenda de Mapa. Class: Legend dentro del Dijit.
         */
        var Leyenda = new Legend({
            map: mapMain,
            arrangement: Legend.ALIGN_RIGHT
        }, "legendDiv");
        Leyenda.startup();

        /*
         * Paso 8: Añadir Widget. Overview. Class: OverviewMap dentro del Dijit.
           El widget OverviewMap muestra la extensión actual del mapa dentro del contexto de un área más grande.  
         */

        var Overview = new OverviewMap({
            map: mapMain,
            visible: true,
            attachTo: "top-right",
            color: "black",
            opacity: 0.3
        });
        Overview.startup();

        /*
        * Paso 9: Añadir Widget. Busqueda en el mapa. Class: Search dentro del Dijit.
        Este widget nos proporciona rapidez de la funcionalidad de la geodificación al añadirla a un mapa.
        Es un widget de búsqueda que utiliza geolocalizador de argisonline. 
        */
        var search = new Search({
            map: mapMain,
            autoComplete: true
        }, "search");

        search.startup();

        /*
        * Paso 10: Añadir Widget. Retorno a la extensión inicial. Class: HomeButton dentro del Dijit.
         Este widget nos proporciona un botón simple para volver a la extensión inicial predeterminada del mapa.  
        */
        var homeButton = new HomeButton({
            map: mapMain,
            extent: extensioninicial,
            visible: true
        }, "HomeButton");
        homeButton.startup();
        
        

        /*
       * Paso 13: En la pestaña de la izquierda que define la funcion de selección de la capa de ciudades,
        insertamos una tabla que nos defina los campos de las entidades seleccionadas.
       */
        ftCities.on("load", function () {
            var TableCities = new FeatureTable({
                featureLayer: ftCities,
                map: mapMain,
                outFields: ["st", "areaname", "class", "pop2000"],
                syncSelection: true,
                zoomToSelection: true,
                fieldInfos: [
                    {
                        name: 'st',
                        alias: 'Estado'
                    },
                    {
                        name: 'areaname',
                        alias: 'Ciudad'
                    }, {
                        name: 'class',
                        alias: 'Clase'
                    }, {
                        name: 'pop2000',
                        alias: 'Habitantes'
                    }],
            }, "TableNode");

            TableCities.startup();
        })

        
    });


 








