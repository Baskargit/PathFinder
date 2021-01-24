class Grid 
{
    constructor(row = 1, col = 1,defaultValue) 
    {
        this.rowCount = row;
        this.colCount = col;
        this.matrix = this.createMatrix(defaultValue);
    }

    updateMatrix(row, col,defaultValue)
    {
        this.rowCount = row;
        this.colCount = col;
        this.matrix = this.createMatrix(defaultValue);
    }

    createMatrix(defaultValue)
    {
        // Initialize one dimension matrix of size n
        var matrix = new Array(this.rowCount);

        // Initialize the second dimension for every row
        for(var i = 0; i < this.rowCount; i++)
        {
            matrix[i] = new Array(this.colCount);
        }

        // Set the Initial values
        for(var i = 0; i < this.rowCount; i++)
        {
            for(var j = 0; j < this.colCount; j++)
            {
                matrix[i][j] = defaultValue;
            }
        }

        // Return the final generated matrix
        return matrix;
    }

}

class GridUi extends Grid
{
    constructor(row, col,defaultValue,gridClassName)
    {
        // call the base class constructor with the required values
        super(row, col,defaultValue);

        // GridUI related properties
        this.colorConfig = new ColorConfig();
        this.animationConfig = new AnimationConfig();
        this.miscConfig = new MiscConfig();
        this.gridClassName = gridClassName;
        this.isMasked = false;
        this.gridSource = "0_0";
        this.gridDestination = (this.rowCount - 1) + "_" + (this.colCount - 1);
        this.setCellTypeKey = "";

        // GridCell properties
        this.gridBorderWidth = 1;
        this.gridCellSize = 25;
        this.gridWidth = this.gridCellSize * col;
        // this.gridCellSize = 25 + (this.gridBorderWidth * 2); // Border of both left and right

        // Register Events
        this.registerColorConfigEvent();

        // Set Keyframes based on colorConfig
        this.setKeyFrames();
    }

    generateGrid()
    {
        var gridContent = "";
        var gridColumnStyle = " style = \"border: " + this.gridBorderWidth + "px solid " + this.colorConfig.cellBorderColor + " !important;" +  " height: " + this.gridCellSize + "px;"  + "width: " + this.gridCellSize + "px;" + "\"";

        for(var i = 0; i < this.rowCount; i++)
        {
            gridContent += "<div class=\"row justify-content-center\">";

            for(var j = 0; j < this.colCount; j++)
            {
                var id = i + "_" + j;
                gridContent += "<div class=\"grid-column\" id=" + "\"" + id + "\"" + " onmouseover=" + "\"window." + this.setCellTypeKey + ".setCellType(" + '\'' + id + '\'' + ")\"" + gridColumnStyle +">";
                gridContent += "</div>";
            }
            
            gridContent += "</div>";
        }

        return gridContent;
    }

    setGridColours() 
    {
        // Set Grid cell colours
        for(var i = 0; i < this.rowCount; i++)
        {
            for(var j = 0; j < this.colCount; j++)
            {
                $("#" + i + "_" + j).css("background-color",this.colorConfig.nonWallColour);
            }
        }

        // Set Source colour
        $("#" + this.gridSource).css("background-color",this.colorConfig.sourceColor);

        // Set Destination colour
        $("#" + this.gridDestination).css("background-color",this.colorConfig.destinationColor);
    }

    drawGrid()
    {
        // Clear all the child elements before draw operation
        $("." + this.gridClassName).empty();

        // Generate Grid content based on the Grid configuration
        var gridContent = this.generateGrid();

        // Set the grid width
        $("." + this.gridClassName).css("width",this.gridWidth + "px");

        // Add all the cell blocks to UI grid
        $("." + this.gridClassName).append(gridContent);

        // Update the gridDestination as per the new grid size configuration
        this.gridSource = "0_0";
        this.gridDestination = (this.rowCount - 1) + "_" + (this.colCount - 1);

        // Set Grid Colors as per color configuration
        this.setGridColours();
    }

    setCellColour(cellId,colour,isHover = false)
    {
        if (cellId != null && colour != null) 
        {
            $("#" + cellId).css("background-color",colour);
        }
    }

    setKeyFrames()
    {
        $.keyframe.define([
        {
            name: 'wallAnimation',
            '0%': {
              'transform': 'scale(.2)',
              'background-color' : this.colorConfig.wallColour
            },
            '50%': {
                'transform': 'scale(1.2)',
                'background-color' : this.colorConfig.wallColour
            },
            '100%': {
                'transform': 'scale(1)',
                'background-color' : this.colorConfig.wallColour
            }
        },
        {
            name: 'nonWallAnimation',
            '0%': {
              'transform': 'scale(.9)',
              'background-color' : this.colorConfig.nonWallColour
            },
            '50%': {
                'transform': 'scale(0.4)',
                'background-color' : this.colorConfig.nonWallColour
            },
            '100%': {
                'transform': 'scale(1)',
                'background-color' : this.colorConfig.nonWallColour
            }
        }]);
    }

    setTraverseCellAnimation(cellId,duration) 
    {
        if (cellId != null && duration != null) 
        {
            $("#" + cellId).css("transition","background-color " + duration + "s" + " ease");
        }
    }

    drawSourceToDestination(traversedPaths)
    {
        var fwdIndex = 0;

        // Inorder to avoid scope issues arrow functions are preferred;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
        var fwdhandler = setInterval(() =>
        {
            if (fwdIndex >= traversedPaths.length) 
            {
                clearInterval(fwdhandler);
            }
            else
            {
                this.setCellColour(traversedPaths[fwdIndex],this.colorConfig.traversedColor);
                this.setTraverseCellAnimation(traversedPaths[fwdIndex],this.animationConfig.fwdTransitionDuration);
                fwdIndex++;            
            }
        } , this.animationConfig.fwdCellToCellDelay);
    }

    drawDestinationToSource(traversedPaths)
    {
        var revIndex = traversedPaths.length - 1;

        // Inorder to avoid scope issues arrow functions are preferred;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
        var revHandler = setInterval(() => 
        { 
            if (revIndex < 0)
            {
                clearInterval(revHandler);
            }
            else
            {
                this.setCellColour(traversedPaths[revIndex],this.colorConfig.revTraverseColor);
                this.setTraverseCellAnimation(traversedPaths[revIndex],this.animationConfig.revTransitionDuration);
                revIndex--;
            }
        } , this.animationConfig.revCellToCellDelay);
    }

    setCellType(posId)
    {
        // Not an alteration in matrix (or) Not masked (meaning, if user clicked 'FindPath' then no other alteration on the matrix is allowed)
        if (!this.isMasked && !window.event.altKey) 
        {
            var splitted = (posId != null) ? posId.split("_") : null ;

            if (splitted != null && splitted.length == 2) 
            {
                // If Position is not both the source and destination then update the data and UI element
                if (posId != this.gridSource && splitted[0] + "_" + splitted[1] != this.gridDestination)
                {
                    // Get cell type
                    // 1 => Block (or) wall
                    // 0 => Travesable path
                    var value = (window.event.ctrlKey) ? 1 : 0 ;

                    // Assign cell type {will be used at the time of finding path}
                    this.matrix[parseInt(splitted[0])][parseInt(splitted[1])] = value;

                    // Update UI with appropriate colour as per configuration settings
                    this.setCellColour(posId,(value == 1) ? this.colorConfig.wallColour : this.colorConfig.nonWallColour,true);
                }
            }
        } 
    }
    
    updateGridConfiguration()
    {
        // Check grid settings provided by the user is valid (or) not
        this.isGridSettingValid(true);

        // Update matrix as per new configuration with default value 0
        this.updateMatrix(this.rowCount,this.colCount,0);

        // Update the grid Wdith as per the new configuration
        this.gridWidth = this.gridCellSize * this.colCount;

        // Update the grid UI as per new RowCount value
        this.drawGrid();

        // Disable the Reset and Re-Run Animation button by default
        this.miscConfig.loadButtonDefaults();
        
    }

    isGridSettingValid(showInvalidMesg = false)
    {
        var isWidthContained = ((window.innerWidth - 30) - this.gridCellSize * this.colCount >= 0) ? true : false;

        this.colCount = (isWidthContained) 
            ? this.colCount
            : Math.floor((window.innerWidth - 30) / this.gridCellSize) ;
        
        if (showInvalidMesg && !isWidthContained) 
        {
            window.alert("Given column setting exceeds the screen width, so current column count is " + this.colCount);
        }

        // Header + Footer + Margin-Top of the grid row
        var occupiedHeight = $("header").outerHeight() + $("footer").outerHeight() + parseInt($('.container-fluid .row').first().css('margin-top')) + 15;
        var currentGridHeight = this.rowCount * this.gridCellSize;
        
        var isHeightContained = (occupiedHeight + currentGridHeight <= window.innerHeight) 
            ? true
            : false;

        if (showInvalidMesg && !isHeightContained) 
        {
            window.alert("Given height setting exceeds the screen height, so current row count is " + this.rowCount);
        }   

        this.rowCount = (isHeightContained) 
        ? this.rowCount 
        : Math.floor((window.innerHeight - occupiedHeight)/this.gridCellSize);

    }

    updateColor(newColor = "",isReload = false)
    {
        const isColor = (newColor) => 
        {
            const s = new Option().style;
            s.color = newColor;
            return s.color !== '';
        }

        // Get last clicked item
        var item = $("#changeColorBtn").attr('value');

        if (item != null && item != "" && isColor) 
        {
            switch (item) 
            {
                case "GCB":
                    this.colorConfig.cellBorderColor = newColor;
                    break;

                case "WAL":
                    this.colorConfig.wallColour = newColor;
                    break;

                case "NWL":
                    this.colorConfig.nonWallColour = newColor;
                    break;

                case "TVS":
                    this.colorConfig.traversedColor = newColor;
                    break;

                case "SRC":
                    this.colorConfig.sourceColor = newColor;
                    break;

                case "DES":
                    this.colorConfig.destinationColor = newColor;
                    break;
            
                default:
                    break;
            }
        }

        if (isReload) {
            this.updateGridConfiguration();
        }
    }

    updateGridCellSize(newSize = 25,isReload = false)
    {
        this.gridCellSize = newSize;

        if (isReload) 
        {
            this.updateGridConfiguration();
        }
    }

    updateGridBorderWidth(newSize = 1,isReload = false)
    {
        this.gridBorderWidth = newSize;

        if (isReload) 
        {
            this.updateGridConfiguration();
        }
    }

    registerColorConfigEvent()
    {
        $("#changeColorDropup p").click(function ()
        {
            // Get the currently clicked item value
            // Update the Text and value for the DropUp button based on the selected item from the list
           $("#changeColorBtn").attr('value',$(this).attr('value'));
           $("#changeColorBtn").html($(this).text());
        });
    }

}

class ColorConfig
{
    // Default Color configurations
    constructor()
    {
        // Source and Destination
        this.sourceColor = "#FF0000";
        this.destinationColor = "#008000";

        // Wall
        this.wallColour = "#0C3547";
        this.nonWallColour = "#FFFFFF00";

        // Flow
        this.traversedColor = "#FFFF00";
        this.revTraverseColor = "#FFFFFF00"; 

        // Cell Border color
        this.cellBorderColor = "#AFD8F8";
    }
}

class AnimationConfig
{
    constructor()
    {
        // Default animation configurations
        this.fwdTransitionDuration = 1; // Seconds
        this.fwdCellToCellDelay = 250; // milliseconds
        this.revTransitionDuration = 0.5; // Seconds
        this.revCellToCellDelay = 50; // milliseconds
    }

}

class MiscConfig
{
    constructor()
    {
        // button id configurations
        this.findPathButtonId = "findPath";
        this.reRunAnimationButtonId = "reRunAnimation";
        this.resetButtonId = "reset";
        this.updateCurrentGridButtonId = "updateCurrentGrid";

        // input Id configurations
        this.rowCountInputId = "rowCount";
        this.columnCountInputId = "columnCount";

        // Div Id configurations
        this.configureColorDiv = "configureColorDiv";

        // Slider configurations
        this.gridCellSizeSliderId = "gridCellSizeSlider";
        this.gridBorderSizeSliderId = "gridBorderSizeSlider";
    }

    disableButton(buttonId) 
    {
        if (buttonId != null) 
        {
            $('#' + buttonId).prop('disabled', true);   
        }
    }

    disableDiv(divId,disableAllDescendants = false)
    {
        if ($("#" + divId).length) 
        {
            if (disableAllDescendants) 
            {
                $("#" + divId + " *").prop('disabled',true);    
            }
            else
            {
                $("#" + divId).prop('disabled',true);
            }
        }
    }

    enableDiv(divId,enableAllDescendants = false)
    {
        if ($("#" + divId).length) 
        {
            if (enableAllDescendants) 
            {
                $("#" + divId + " *").prop('disabled',false);    
            }
            else
            {
                $("#" + divId).prop('disabled',false);
            }
        }
    }

    enableButton(buttonId) 
    {
        if (buttonId != null) 
        {
            $('#' + buttonId).prop('disabled', false);
        }
    }

    loadButtonDefaults() 
    {
        this.disableButton(this.reRunAnimationButtonId);
        this.disableButton(this.resetButtonId);
        this.disableButton(this.updateCurrentGridButtonId);
        this.enableButton(this.findPathButtonId);
    }

    closeConfigureModal()
    {
        $('#configureModal').modal('hide');
    }
}