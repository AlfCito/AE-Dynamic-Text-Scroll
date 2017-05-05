///////////////////////////////// MY VARIABLES //////////////////////////////////////////////////
var scriptFolder;
var myItemCollection = app.project.items;
var myComp;

var compName = "ScrollPreComp";
var compWidth = 1920;
var compHeight = 1080;
var compDuration;
var compFrameRate = 29.97;
var compBG = [48/255,63/255,84/255] // comp background color

var spacer = 100;
var timeSpacer = 1; // in seconds
var separator = ":";
var caracteresMaximos = 35;
var textColor = [0.094, 0.086, 0.059];

var fontSize = 46;
var red = 255;
var green = 255;
var blue = 255;

var isBold = true;

var lineArray = [];
var counter = 0;
var animationLength;
var rotAnimaAngle;


/////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////// USER INTERFACE //////////////////////////////////////////////////

//Palette var
var myPalette = buildUI(this);

if(myPalette != null  && myPalette instanceof Window){
    myPalette.show();
}

//////////////////////////////// USER INTERFACE FUNCTIONS //////////////////////////////////////////////////

function buildUI(thisObject){

    if(thisObject instanceof Panel){
        var myPalette = thisObject;
    }else{
        var myPalette = new Window("palette", "ScrollText",undefined, {resizeable: true});
    }//if(thisObject instanceof Panel)

   if(myPalette != null){
        
        var res =
        "Group { \
        orientation:'column',\
              compSettings: Panel {alignment:['fill','top'],\
              text: \"COMP SETTINGS\",\
                       compTitle: StaticText {text: 'Comp Size: ', alignment:['center','']}, \
                      compGrp: Group{\
                                comp: StaticText {text: ' Width:', alignment:['center','']}, \
                                compWidth: EditText{text: '1920', characters: 4},\
                                comp: StaticText {text: ' Height:', alignment:['center','']}, \
                                compHeight: EditText{text: '1080', characters: 4},\
                            }\
                        frameGrp: Group{\
                                comp: StaticText {text: 'Frame Rate: ', alignment:['center','']}, \
                                compFrameRate: EditText{text: '29.97', characters: 5},\
                            }\
                        }\
              scrollSettings: Panel {alignment:['fill','top'],\
              text: \"SCROLL SETTINGS\",\
                    spacerGrp: Group{\
                        txtSpacer: StaticText {text: 'Text Separation:', alignment:['center','']}, \
                        txtSpacerData: EditText{text: '100', characters: 4},\
                    }\
                    timeGrp: Group{\
                        timeSpacer: StaticText {text: 'Time Separation:', alignment:['center','']}, \
                        timeSpacerData: EditText{text: '1', characters: 2},\
                    }\
                    fontGrp: Group{\
                        fontSize: StaticText {text: 'Font Size:', alignment:['center','']}, \
                        fontSizeData: EditText{text: '46', characters: 2},\
                    }\
                    colorGrp: Group{\
                        colorValue: StaticText {text: 'Color - R:', alignment:['center','']}, \
                        userRed: EditText{text: '255', characters: 3},\
                        colorValue: StaticText {text: 'G:', alignment:['center','']}, \
                        userGreen: EditText{text: '255', characters: 3},\
                        colorValue: StaticText {text: 'B:', alignment:['center','']}, \
                        userBlue: EditText{text: '255', characters: 3},\
                    }\
                    maxCharGrp: Group{\
                        maxChar: StaticText {text: 'Max characters per line:', alignment:['center','']}, \
                        maxCharData: EditText{text: '35', characters: 2},\
                    }\
                    charGrp: Group{\
                        checkBtn: Checkbox {text: 'Bold'},\
                        charSpacer: StaticText {text: 'String delimiter:', alignment:['center','']}, \
                        charSpacerData: EditText{text: ':', characters: 1},\
                    }\
                    scrollGrp: Group{\
                        orientation:'column',\
                        dataBtn: Button {text: 'Select File', alignment:['center','top']},\
                        myWebAbout: StaticText {text: 'www.eyproducciones.com', alignment:['center','']},\
                    }\
                }\
        }";    
        
        myPalette.grp = myPalette.add(res);
        myPalette.layout.layout(true);
        myPalette.layout.resize();
        
       
       myPalette.grp.scrollSettings.scrollGrp.dataBtn.onClick = function(){
                //scrollGenerator(myPalette);
                init(myPalette);
         }//convertBtn Click  
     
        //initialize the bold checkbox as true
        myPalette.grp.scrollSettings.charGrp.checkBtn.value = true;
        
        myPalette.onResizing = myPalette.onResize = function(){this.layout.resize();}
   
   }// if(myPalette != true)

    return myPalette;
    
}//function buildUI()

///////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////

function init(palObj){
    
    // create undo group
    app.beginUndoGroup("Crear Scroll");
        
    compWidth = Number (palObj.grp.compSettings.compGrp.compWidth.text);
    compHeight = Number (palObj.grp.compSettings.compGrp.compHeight.text);
    compFrameRate = Number (palObj.grp.compSettings.frameGrp.compFrameRate.text);

    spacer =  Number (palObj.grp.scrollSettings.spacerGrp.txtSpacerData.text);
    timeSpacer = Number (palObj.grp.scrollSettings.timeGrp.timeSpacerData.text);
    separator = palObj.grp.scrollSettings.charGrp.charSpacerData.text
    caracteresMaximos = Number (palObj.grp.scrollSettings.maxCharGrp.maxCharData.text);
    
    isBold = myPalette.grp.scrollSettings.charGrp.checkBtn.value;
    
    fontSize = Number (palObj.grp.scrollSettings.fontGrp.fontSizeData.text);
    red  = Number (palObj.grp.scrollSettings.colorGrp.userRed.text);
    green  = Number (palObj.grp.scrollSettings.colorGrp.userGreen.text);
    blue  = Number (palObj.grp.scrollSettings.colorGrp.userBlue.text);
    
    textColor = [red, green, blue];
    
   
    var camZoom = compWidth * 0.972222
       
    myReset();
   
    // Prompt user to select text file
    var myFile = File.openDialog("Por favor selecciona el archivo de texto.");
    if (myFile != null){
        
        // open file
        var fileOK = myFile.open("r");
        if (fileOK){

        // create project if necessary
        var proj = app.project;
        if(!proj) proj = app.newProject();
        
        // read text lines and create text array
        var text;
        while (!myFile.eof){
            text = myFile.readln();
            if (text == "") text = "\r" ;
            lineArray.push(text);
        }

        // close the file before exiting
        myFile.close();

        
        //Script root folder creation
        scriptFolder = app.project.items.addFolder("Scroll Creditos");
        scriptFolder.label = 0;
        
        animationLength = lineArray.length * timeSpacer;
        rotAnimaAngle = lineArray.length * -90;
        
        // create new comp 
        myComp = myItemCollection.addComp(compName,compWidth,compHeight,1,animationLength+(timeSpacer*2),compFrameRate);
        myComp.bgColor = compBG;
        myComp.parentFolder = scriptFolder;
        
        var myCamera = myComp.layers.addCamera("scrollCamera", [compWidth/2, compHeight/2]);
        myCamera.property("position").setValue([compWidth/2, compHeight/2, camZoom*-1]);
        myCamera.property("zoom").setValue(camZoom); 
        
        var nullAnimator  = myComp.layers.addNull();
        nullAnimator.name = "nullAnimator";
        nullAnimator.threeDLayer = true;

        
        }else{
            alert("File open failed!");
        }
 
    }else{
        alert("No text file selected.");
    }

    generator();

    app.endUndoGroup();
};

function splice(str, start, delCount, newSubStr) {
        return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
};

function generator(theNull){
    

    for(var i = 0; i<lineArray.length; i++){
        
        var textLayer = myComp.layers.addText(lineArray[i]);
        
        var stringLength = lineArray[i].length;
        var bold = lineArray[i].indexOf(separator);
          
        if(stringLength > caracteresMaximos){
            lineArray[i] = splice(lineArray[i], bold+1, 0, "\n");
        }
        
        var textProp = textLayer.property("Source Text");
        var textDocument = textProp.value;
        myString = lineArray[i];
        textDocument.resetCharStyle();
        textDocument.fontSize = fontSize;
        textDocument.strokeWidth = 0;
        //textDocument.font = "Sitka";
        textDocument.strokeOverFill = true;
        textDocument.applyStroke = true;
        textDocument.applyFill = true;
        textDocument.text = myString;
        textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
        // textDocument.tracking = 0;
        textProp.setValue(textDocument);    
        
                
        var textColorEffects = textLayer.Text.Animators.addProperty("ADBE Text Animator");
        var colorSelector = textColorEffects.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        textColorEffects.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color").setValue(textColor); 
        
        if(isBold){
            var textEffects = textLayer.Text.Animators.addProperty("ADBE Text Animator");
            var textEffectSelector = textEffects.property("ADBE Text Selectors").addProperty("ADBE Text Selector"); 
            textEffectSelector.property("ADBE Text Range Advanced").property("ADBE Text Range Units").setValue(2);
            textEffectSelector.property("ADBE Text Index End").setValue(bold+1);
            textEffects.property("ADBE Text Animator Properties").addProperty("ADBE Text Stroke Color").setValue(textColor);  
            textEffects.property("ADBE Text Animator Properties").addProperty("ADBE Text Stroke Width").setValue(1);
        }
        
        
        textLayer.threeDLayer = true;
                
        if(counter == 0){
            textLayer.position.expression = '[position[0], position[1]+'+spacer+', position[2]];'
            counter++;
        }else if(counter == 1){
            textLayer.position.expression = '[position[0], position[1], position[2]+'+spacer+'];'
            counter++;
        }else if(counter == 2){
            textLayer.position.expression = '[position[0], position[1]-'+spacer+', position[2]];'
            counter++;
         }else if(counter == 3){
            textLayer.position.expression = '[position[0], position[1], position[2]-'+spacer+'];'
            counter = 0;
         }
     
        var layerInPoint =  i * timeSpacer;
        var theNull =scriptFolder.item(1).layer("nullAnimator");
   
        textLayer.property("opacity").setValuesAtTimes([layerInPoint, layerInPoint+timeSpacer, layerInPoint+(timeSpacer*2)], [0,100,0]);
        textLayer.inPoint = layerInPoint;
        textLayer.parent = theNull;
        textLayer.autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST;
       
    }

    theNull.property("xRotation").setValuesAtTimes([0,animationLength+(timeSpacer*2)],[0,rotAnimaAngle-180]);
};



function myReset(){
    scriptFolder = "";
    scrollRenderComp = "";
    myComp = "";

    lineArray = [];
    counter = 0;
    animationLength = 0;
    rotAnimaAngle = 0;
}
