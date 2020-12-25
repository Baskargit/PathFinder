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
        this.gridClassName = gridClassName;
        this.isMasked = false;
    }

    generateGrid()
    {
        var gridContent = "";

        for(var i = 0; i < this.rowCount; i++)
        {
            gridContent += "<div class=\"grid-row\">";

            for(var j = 0; j < this.colCount; j++)
            {
                var id = i + "_" + j;
                gridContent += "<div class=\"grid-column\" id=" + "\"" + id + "\"" + " onmouseover=" + "\"window.simplePathFinder.setCellType(" + '\'' + id + '\'' + ")\"" + ">";
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
        $("#0_0").css("background-color",this.colorConfig.sourceColor);

        // Set Destination colour
        $("#" + (this.rowCount - 1) + "_" + (this.colCount - 1)).css("background-color",this.colorConfig.destinationColor);
    }

    drawGrid()
    {
        // Clear all the child elements before draw operation
        $("." + this.gridClassName).empty();

        // Generate Grid content based on the Grid configuration
        var gridContent = this.generateGrid();

        // Add all the cell blocks to UI grid
        $("." + this.gridClassName).append(gridContent);

        // Set Grid Colors as per color configuration
        this.setGridColours();
    }

    setCellColour(cellId,colour)
    {
        if (cellId != null && colour != null) 
        {
            $("#" + cellId).css("background-color",colour);
        }    
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
                if (posId != "0_0" && splitted[0] + "_" + splitted[1] != (this.rowCount - 1) + "_" + (this.colCount - 1))
                {
                    // Get cell type
                    // 1 => Block (or) wall
                    // 0 => Travesable path
                    var value = (window.event.ctrlKey) ? 1 : 0 ;

                    // Assign cell type {will be used at the time of finding path}
                    this.matrix[parseInt(splitted[0])][parseInt(splitted[1])] = value;

                    // Update UI with appropriate colour as per configuration settings
                    this.setCellColour(posId,(value == 1) ? this.colorConfig.wallColour : this.colorConfig.nonWallColour);
                }
            }
        } 
    }
    
}

class ColorConfig
{
    constructor()
    {
        // Default Color configurations
        this.sourceColor = "red";
        this.destinationColor = "green";
        this.wallColour = "black";
        this.nonWallColour = "transparent";
        this.traversedColor = "blue";
        this.gridColour = "blueviolet";
        this.revTraverseColor = "transparent";
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
    }

    disableButton(buttonId) 
    {
        if (buttonId != null) 
        {
            $('#' + buttonId).prop('disabled', true);   
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
}