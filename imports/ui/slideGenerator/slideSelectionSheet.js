import "./slideSelectionSheet.html";
import { getSlideGenApp, getAllSlides } from "/imports/ui/useCases/useCaseSelection";
import { Reveal } from "/imports/ui/slideGenerator/slides";


Template.slideSelectionSheet.onRendered(function () {
    var iFrame = document.getElementById('selectionSlide');
    // console.log('!!!!!!!!!!!!!!!! resize selection sheet')
    resizeIFrameToFitContent(iFrame);
});


Template.slideSelectionSheet.events({
    "click #sheetSelector": async function (event, template) {
        event.preventDefault();
        Session.set("showSelector", false);

        //RESET SENSE SELECTION OBJECT
        var qix = await getSlideGenApp();
        qix.abortModal(true);

        //reset the slideheaders to ensure all slide content templates are re-rendered.
        Session.set("slideHeaders", null); 
        
        //get slides
        await getAllSlides();

        ////go to the first slide after a data refresh.           
        Reveal.slide(0); 
    }
});

function resizeIFrameToFitContent(iFrame) {
    iFrame.width = window.innerHeight *.7; //document.body.scrollWidth * .5;
    iFrame.height = document.body.scrollHeight * .4;
}


Template.slideSelectionSheet.onCreated(async function () {
    $("body").css({
        overflow: "auto"
    })

    $(".reveal").css({
        visibility: 'hidden'
       })

    
});

Template.slideSelectionSheet.onDestroyed(function () {
    $("body").css({
        overflow: "auto"
    });

    $(".reveal").css({
        visibility: ''
    })
});