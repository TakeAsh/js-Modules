# js-Modules
- Javascript modules and their samples

## AutoSaveConfig
- This class saves the properties in localStorage automatically when they are set.
- It allow an instance of a class as a property, when the instance must be rebuilded by "assign" method with its "toJSON" output object.
- Sample: [Clock](https://raw.githack.com/TakeAsh/js-Modules/main/Clock/)<br>
Simple digital clock. It can change color.

## Clipboard
- Sample: [JpnHolidays](https://raw.githack.com/TakeAsh/js-Modules/main/JpnHolidays/)<br>
Show Japanese holidays.

### copyToClipboard()
- Copy text to clipboard.
- `execCommand` method is no longer recommended.

### writeToClipboard()
- Write text to clipboard.

## CyclicEnum
- Sample
  - [001_Signal](https://raw.githack.com/TakeAsh/js-Modules/main/CyclicEnum/001_Signal.html)<br>It changes `Green` -> `Yellow` -> `Red` -> `Green` -> ...
  - [002_Settings](https://raw.githack.com/TakeAsh/js-Modules/main/CyclicEnum/002_Settings.html)<br>CyclicEnum is used with `AutoSaveConfig`.
  - [003_Attribute](https://raw.githack.com/TakeAsh/js-Modules/main/CyclicEnum/003_Attribute.html)<br>each EnumItems have its own attributes and common methods.
  - [004_Primitive](https://raw.githack.com/TakeAsh/js-Modules/main/CyclicEnum/004_Primitive.html)<br>EnumItems have primitive values.

## Util

### getNodesByXpath()
- Get nodes specified by XPath as array instead of iterator.

### downloadMedia()
- Download media from cross-origin site.

### getQuery()
- Convert location.search into a hash.

## WorkerManager
- Helper class for Web Worker.
- Sample: [Amazon Images](https://www.takeash.net/js/AmazonImages/)<br>
Enter Amazon.co.jp product url in `URL` and click `Check`, then scan images of the product.
