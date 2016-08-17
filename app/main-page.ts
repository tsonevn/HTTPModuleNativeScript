import { Page } from "ui/page";
import {Observable, EventData} from "data/observable";
import {Cache} from "ui/image-cache";
import {ImageSource, fromFile} from "image-source";
import {ObservableArray} from "data/observable-array"
import {getJSON, getImage} from "http";
import {resources} from "application"

let source:ObservableArray<DataItem>
var cache = new Cache();
cache.maxRequests = 10;
cache.placeholder = fromFile("~/files/icon.png");
resources["dateConverter"] = dateConverter;
resources["dateFormat"] = "DD.MM.YYYY hh:mm:ss";


class DataItem {
    constructor(public id: number, public title: string, public datetime: Date, public imageSource:ImageItem) { }
}

// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
    // Get the event sender
    var page = <Page>args.object;

    let observable:Observable = new Observable();
    source = new ObservableArray<DataItem>();


    let date = new Date();
    
    source.push(new DataItem(1, "Title1", date, new ImageItem("https://httpbin.org/image/webp")));


    observable.set("source", source);
    loadData();
    page.bindingContext=observable;
}

function loadData()
{
    setTimeout(function(){
        let counter:number = 2;
        setInterval(function(){ 
                var randNumber:number = Math.floor(Math.random() * 3);
                var imageUrlArray:Array<string> = ["https://httpbin.org/image/png", "https://httpbin.org/image/jpeg", "https://httpbin.org/image/webp"];
                if(counter < 11){
                
                            getJSON("https://httpbin.org//cookies/set?title=Title"+counter).then(function (r) {
                                console.log("result");
                                var date = new Date();
                                source.push(new DataItem(counter, r["cookies"]["title"], date, new ImageItem(imageUrlArray[randNumber])));
                            }, function (e) {
                                
                                console.log(e);
                            });
                }
                else{
                    if(counter == 11){
                        alert("All items have been download");
                    }
                }
                counter++;
            },1500);

        },1000);
}


function dateConverter(value, format) {
    var result = format;
    var day = value.getDate();
    result = result.replace("DD", day < 10 ? "0" + day : day);
    var month = value.getMonth() + 1;
    result = result.replace("MM", month < 10 ? "0" + month : month);
    result = result.replace("YYYY", value.getFullYear());
    result = result.replace("hh", value.getHours());
    result = result.replace("mm", value.getMinutes());
    result = result.replace("ss", value.getSeconds());
    return result;
};

export class ImageItem extends Observable
{
    private _imageSource: string
    get imageSource(): ImageSource
    {
        var image = cache.get(this._imageSource);

        if (image)
        {
            return image;
        }

        cache.push(
            {
                key: this._imageSource
                , url: this._imageSource
                , completed:
                (image) =>
                {
                    this.notify(
                        {
                            object: this
                            , eventName: Observable.propertyChangeEvent
                            , propertyName: "imageSource"
                            , value: image
                        });
                }
            });

        return cache.placeholder;
    }

    constructor(imageSrc : string)
    {
        super();
        this._imageSource = imageSrc;
    }
}